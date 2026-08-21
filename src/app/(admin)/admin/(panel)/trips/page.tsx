'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';
import AdminLoading from '@/components/admin/AdminLoading/AdminLoading';

const TRIP_LOCALES = ['sk', 'cs', 'de', 'en', 'ru', 'uk', 'pl'] as const;
type TripLocale = (typeof TRIP_LOCALES)[number];

type FaqItem = { q: string; a: string };

interface TripTranslation {
  locale: string;
  name: string;
  description: string | null;
  itinerary: string | null;
  headline: string | null;
  audience: string | null;
  included: string | null;
  extrasNote: string | null;
  bookingNote: string | null;
  tags: string | null;
  faq: FaqItem[] | null;
}

interface TripGalleryImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

interface TripVideo {
  id: string;
  url: string;
  poster: string | null;
  caption: string | null;
  sortOrder: number;
}

interface Trip {
  id: string;
  slug: string;
  coverImage: string | null;
  dateStart: string;
  dateEnd: string | null;
  price: number;
  priceChild: number | null;
  currency: string;
  maxSeats: number | null;
  bookedSeats: number;
  active: boolean;
  sortOrder: number;
  prepayment: number | null;
  bookingPhone: string | null;
  seatsTotal: number | null;
  readMinutes: number | null;
  translations: TripTranslation[];
  galleryImages: TripGalleryImage[];
  videos: TripVideo[];
}

type TranslationDraft = Record<TripLocale, {
  name: string;
  description: string;
  itinerary: string;
  headline: string;
  audience: string;
  included: string;
  extrasNote: string;
  bookingNote: string;
  tags: string;
  faq: FaqItem[];
}>;

function emptyTranslations(): TranslationDraft {
  return Object.fromEntries(
    TRIP_LOCALES.map((l) => [l, {
      name: '', description: '', itinerary: '',
      headline: '', audience: '', included: '',
      extrasNote: '', bookingNote: '', tags: '',
      faq: [] as FaqItem[],
    }]),
  ) as TranslationDraft;
}

function parseFaq(raw: unknown): FaqItem[] {
  if (!Array.isArray(raw)) return [];
  return (raw as unknown[]).filter(
    (item): item is FaqItem =>
      typeof item === 'object' && item !== null &&
      'q' in item && typeof (item as FaqItem).q === 'string' &&
      'a' in item && typeof (item as FaqItem).a === 'string',
  );
}

function getTripName(trip: Trip): string {
  return trip.translations.find((t) => t.locale === 'sk')?.name
    ?? trip.translations[0]?.name
    ?? trip.slug;
}

function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}

export default function AdminTripsPage() {
  const { locale } = useAdminLocale();
  const t = getAdminT(locale);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [activeLocaleTab, setActiveLocaleTab] = useState<TripLocale>('sk');
  const coverFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);

  const [editGallery, setEditGallery] = useState<TripGalleryImage[]>([]);
  const [editVideos, setEditVideos] = useState<TripVideo[]>([]);

  const [form, setForm] = useState({
    dateStart: '',
    dateEnd: '',
    price: 0,
    priceChild: '',
    maxSeats: '',
    coverImage: '',
    active: true,
    prepayment: '',
    bookingPhone: '',
    seatsTotal: '',
    readMinutes: '',
  });
  const [translations, setTranslations] = useState<TranslationDraft>(emptyTranslations());

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/trips');
      if (r.ok) setTrips(await r.json() as Trip[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function resetForm() {
    setForm({ dateStart: '', dateEnd: '', price: 0, priceChild: '', maxSeats: '', coverImage: '', active: true, prepayment: '', bookingPhone: '', seatsTotal: '', readMinutes: '' });
    setTranslations(emptyTranslations());
    setActiveLocaleTab('sk');
    setEditGallery([]);
    setEditVideos([]);
    if (coverFileRef.current) coverFileRef.current.value = '';
    if (galleryFileRef.current) galleryFileRef.current.value = '';
    if (videoFileRef.current) videoFileRef.current.value = '';
  }

  function startAdd() {
    resetForm();
    setEditId(null);
    setShowAdd(true);
  }

  function startEdit(trip: Trip) {
    const draft = emptyTranslations();
    for (const tr of trip.translations) {
      if (TRIP_LOCALES.includes(tr.locale as TripLocale)) {
        draft[tr.locale as TripLocale] = {
          name: tr.name,
          description: tr.description ?? '',
          itinerary: tr.itinerary ?? '',
          headline: tr.headline ?? '',
          audience: tr.audience ?? '',
          included: tr.included ?? '',
          extrasNote: tr.extrasNote ?? '',
          bookingNote: tr.bookingNote ?? '',
          tags: tr.tags ?? '',
          faq: parseFaq(tr.faq),
        };
      }
    }
    setForm({
      dateStart: toDateInput(trip.dateStart),
      dateEnd: trip.dateEnd ? toDateInput(trip.dateEnd) : '',
      price: trip.price,
      priceChild: trip.priceChild != null ? String(trip.priceChild) : '',
      maxSeats: trip.maxSeats != null ? String(trip.maxSeats) : '',
      coverImage: trip.coverImage ?? '',
      active: trip.active,
      prepayment: trip.prepayment != null ? String(trip.prepayment) : '',
      bookingPhone: trip.bookingPhone ?? '',
      seatsTotal: trip.seatsTotal != null ? String(trip.seatsTotal) : '',
      readMinutes: trip.readMinutes != null ? String(trip.readMinutes) : '',
    });
    setTranslations(draft);
    setEditGallery(trip.galleryImages ?? []);
    setEditVideos(trip.videos ?? []);
    setActiveLocaleTab('sk');
    setEditId(trip.id);
    setShowAdd(false);
  }

  function cancelForm() {
    setEditId(null);
    setShowAdd(false);
    resetForm();
  }

  function setTr<K extends keyof TranslationDraft[TripLocale]>(key: K, value: TranslationDraft[TripLocale][K]) {
    setTranslations((p) => ({ ...p, [activeLocaleTab]: { ...p[activeLocaleTab], [key]: value } }));
  }

  // ── Cover upload ──
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('purpose', 'trips');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    setUploadingCover(false);
    if (res.ok) {
      const { url } = await res.json() as { url: string };
      setForm((p) => ({ ...p, coverImage: url }));
    } else {
      alert(t.trips.imageUploadError);
    }
  }

  // ── Gallery upload ──
  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editId) return;
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingGallery(true);
    const added: Array<{ url: string }> = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('purpose', 'gallery');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json() as { url: string };
        added.push({ url });
      } else {
        alert(t.trips.imageUploadError);
      }
    }
    if (added.length) {
      const res = await fetch(`/api/admin/trips/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryAdd: added }),
      });
      if (res.ok) {
        const updated = await res.json() as Trip;
        setEditGallery(updated.galleryImages ?? []);
      }
    }
    setUploadingGallery(false);
    if (galleryFileRef.current) galleryFileRef.current.value = '';
  }

  async function removeGalleryImage(imageId: string) {
    if (!editId) return;
    const res = await fetch(`/api/admin/trips/${editId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ galleryRemove: [imageId] }),
    });
    if (res.ok) {
      const updated = await res.json() as Trip;
      setEditGallery(updated.galleryImages ?? []);
    }
  }

  // ── Video upload ──
  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('purpose', 'trip-video');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const { url } = await res.json() as { url: string };
      const patchRes = await fetch(`/api/admin/trips/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoAdd: [{ url }] }),
      });
      if (patchRes.ok) {
        const updated = await patchRes.json() as Trip;
        setEditVideos(updated.videos ?? []);
      }
    } else {
      const err = await res.json() as { error?: string };
      alert(err.error ?? 'Video upload failed');
    }
    setUploadingVideo(false);
    if (videoFileRef.current) videoFileRef.current.value = '';
  }

  async function removeVideo(videoId: string) {
    if (!editId) return;
    const res = await fetch(`/api/admin/trips/${editId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoRemove: [videoId] }),
    });
    if (res.ok) {
      const updated = await res.json() as Trip;
      setEditVideos(updated.videos ?? []);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const hasName = TRIP_LOCALES.some((l) => translations[l].name.trim());
    if (!hasName || !form.dateStart || !form.price) return;
    setSaving(true);

    const payload = {
      coverImage: form.coverImage || null,
      dateStart: form.dateStart,
      dateEnd: form.dateEnd || undefined,
      price: Number(form.price),
      priceChild: form.priceChild ? Number(form.priceChild) : undefined,
      maxSeats: form.seatsTotal ? Number(form.seatsTotal) : (form.maxSeats ? Number(form.maxSeats) : undefined),
      active: form.active,
      prepayment: form.prepayment ? Number(form.prepayment) : undefined,
      bookingPhone: form.bookingPhone.trim() || undefined,
      seatsTotal: form.seatsTotal ? Number(form.seatsTotal) : undefined,
      readMinutes: form.readMinutes ? Number(form.readMinutes) : undefined,
      translations: TRIP_LOCALES
        .filter((l) => translations[l].name.trim())
        .map((l) => ({
          locale: l,
          name: translations[l].name,
          description: translations[l].description || undefined,
          itinerary: translations[l].itinerary || undefined,
          headline: translations[l].headline || undefined,
          audience: translations[l].audience || undefined,
          included: translations[l].included || undefined,
          extrasNote: translations[l].extrasNote || undefined,
          bookingNote: translations[l].bookingNote || undefined,
          tags: translations[l].tags || undefined,
          faq: translations[l].faq.length ? translations[l].faq : undefined,
        })),
    };

    const url = editId ? `/api/admin/trips/${editId}` : '/api/admin/trips';
    const method = editId ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      cancelForm();
      await load();
    }
  }

  async function remove(trip: Trip) {
    if (!window.confirm(t.trips.confirmDelete)) return;
    await fetch(`/api/admin/trips/${trip.id}`, { method: 'DELETE' });
    await load();
  }

  async function toggleActive(trip: Trip) {
    await fetch(`/api/admin/trips/${trip.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !trip.active }),
    });
    await load();
  }

  if (loading) return <AdminLoading rows={4} />;

  const showForm = showAdd || editId !== null;
  const trDraft = translations[activeLocaleTab];

  const fieldStyle = { gridColumn: '1 / -1' } as const;
  const halfStyle = {} as const;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>{t.trips.title}</h1>
        {!showForm && (
          <button type="button" className="btn-primary btn-sm" onClick={startAdd}>
            {t.trips.addTrip}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={save} className="admin-masters__form" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
            {editId ? t.trips.editTrip : t.trips.addTrip}
          </h2>

          {/* ── Locale tabs ── */}
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginRight: '0.5rem', alignSelf: 'center' }}>
              {t.trips.localeTabsLabel}:
            </span>
            {TRIP_LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setActiveLocaleTab(l)}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--border-radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: activeLocaleTab === l ? 'var(--color-gold)' : 'var(--color-bg-card)',
                  color: activeLocaleTab === l ? '#000' : 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  cursor: 'pointer',
                  fontWeight: activeLocaleTab === l ? 600 : 400,
                }}
              >
                {l.toUpperCase()}
                {translations[l].name.trim() && (
                  <span style={{ marginLeft: '0.25rem', color: activeLocaleTab === l ? '#000' : 'var(--color-gold)' }}>✓</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Per-locale translation fields ── */}
          <div className="admin-services__form-grid">
            <div className="booking__field" style={fieldStyle}>
              <label>{t.trips.nameLabel} ({activeLocaleTab.toUpperCase()}) *</label>
              <input
                value={trDraft.name}
                onChange={(e) => setTr('name', e.target.value)}
                placeholder={t.trips.nameLabel}
              />
            </div>
            <div className="booking__field" style={fieldStyle}>
              <label>Headline / tagline ({activeLocaleTab.toUpperCase()})</label>
              <input
                value={trDraft.headline}
                onChange={(e) => setTr('headline', e.target.value)}
                placeholder="Krátky slogan pod nadpisom"
              />
            </div>
            <div className="booking__field" style={fieldStyle}>
              <label>{t.trips.descriptionLabel} ({activeLocaleTab.toUpperCase()})</label>
              <textarea
                rows={3}
                value={trDraft.description}
                onChange={(e) => setTr('description', e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <div className="booking__field" style={fieldStyle}>
              <label>Pre koho je zájazd — Audience ({activeLocaleTab.toUpperCase()})</label>
              <textarea
                rows={3}
                value={trDraft.audience}
                onChange={(e) => setTr('audience', e.target.value)}
                placeholder="Každý riadok = 1 bod"
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <div className="booking__field" style={fieldStyle}>
              <label>{t.trips.itineraryLabel} ({activeLocaleTab.toUpperCase()})</label>
              <textarea
                rows={5}
                value={trDraft.itinerary}
                onChange={(e) => setTr('itinerary', e.target.value)}
                placeholder="Každý riadok = 1 krok programu"
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <div className="booking__field" style={fieldStyle}>
              <label>V cene — Included ({activeLocaleTab.toUpperCase()})</label>
              <textarea
                rows={3}
                value={trDraft.included}
                onChange={(e) => setTr('included', e.target.value)}
                placeholder="Každý riadok = 1 položka"
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <div className="booking__field" style={fieldStyle}>
              <label>Príplatky — Extras note ({activeLocaleTab.toUpperCase()})</label>
              <textarea
                rows={2}
                value={trDraft.extrasNote}
                onChange={(e) => setTr('extrasNote', e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <div className="booking__field" style={fieldStyle}>
              <label>Poznámka k rezervácii — Booking note ({activeLocaleTab.toUpperCase()})</label>
              <textarea
                rows={2}
                value={trDraft.bookingNote}
                onChange={(e) => setTr('bookingNote', e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <div className="booking__field" style={fieldStyle}>
              <label>Tags ({activeLocaleTab.toUpperCase()}) — čiarkou oddelené</label>
              <input
                value={trDraft.tags}
                onChange={(e) => setTr('tags', e.target.value)}
                placeholder="Viedeň, 1 deň, rodiny"
              />
            </div>

            {/* ── FAQ editor ── */}
            <div className="booking__field" style={fieldStyle}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>FAQ ({activeLocaleTab.toUpperCase()})</span>
                <button
                  type="button"
                  className="btn-outline btn-sm"
                  onClick={() => setTr('faq', [...trDraft.faq, { q: '', a: '' }])}
                >
                  + Pridať otázku
                </button>
              </label>
              {trDraft.faq.map((item, idx) => (
                <div key={idx} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', padding: '0.75rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>#{idx + 1}</span>
                    <button
                      type="button"
                      className="btn-outline btn-sm"
                      style={{ color: 'var(--color-error, #e53)', padding: '0.1rem 0.5rem' }}
                      onClick={() => setTr('faq', trDraft.faq.filter((_, i) => i !== idx))}
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    value={item.q}
                    onChange={(e) => {
                      const updated = [...trDraft.faq];
                      updated[idx] = { ...updated[idx], q: e.target.value };
                      setTr('faq', updated);
                    }}
                    placeholder="Otázka"
                  />
                  <textarea
                    rows={2}
                    value={item.a}
                    onChange={(e) => {
                      const updated = [...trDraft.faq];
                      updated[idx] = { ...updated[idx], a: e.target.value };
                      setTr('faq', updated);
                    }}
                    placeholder="Odpoveď"
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Global scalar fields ── */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Globálne nastavenia
            </p>
          </div>
          <div className="admin-services__form-grid">
            <div className="booking__field" style={halfStyle}>
              <label>{t.trips.dateStartLabel} *</label>
              <input
                type="date"
                value={form.dateStart}
                onChange={(e) => setForm((p) => ({ ...p, dateStart: e.target.value }))}
                required
              />
            </div>
            <div className="booking__field" style={halfStyle}>
              <label>{t.trips.dateEndLabel}</label>
              <input
                type="date"
                value={form.dateEnd}
                onChange={(e) => setForm((p) => ({ ...p, dateEnd: e.target.value }))}
              />
            </div>
            <div className="booking__field" style={halfStyle}>
              <label>Cena dospelý (EUR) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="booking__field" style={halfStyle}>
              <label>Cena dieťa (EUR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.priceChild}
                onChange={(e) => setForm((p) => ({ ...p, priceChild: e.target.value }))}
                placeholder="voliteľné"
              />
            </div>
            <div className="booking__field" style={halfStyle}>
              <label>Záloha / Prepayment (EUR)</label>
              <input
                type="number"
                min="0"
                value={form.prepayment}
                onChange={(e) => setForm((p) => ({ ...p, prepayment: e.target.value }))}
              />
            </div>
            <div className="booking__field" style={halfStyle}>
              <label>Max miest (kapacita)</label>
              <input
                type="number"
                min="1"
                value={form.seatsTotal}
                onChange={(e) => setForm((p) => ({ ...p, seatsTotal: e.target.value }))}
              />
            </div>
            <div className="booking__field" style={halfStyle}>
              <label>Telefón / WhatsApp pre rezerváciu</label>
              <input
                type="text"
                value={form.bookingPhone}
                onChange={(e) => setForm((p) => ({ ...p, bookingPhone: e.target.value }))}
                placeholder="+421 900 000 000"
              />
            </div>
            <div className="booking__field" style={halfStyle}>
              <label>Čas čítania (minúty, voliteľné)</label>
              <input
                type="number"
                min="1"
                value={form.readMinutes}
                onChange={(e) => setForm((p) => ({ ...p, readMinutes: e.target.value }))}
                placeholder="auto"
              />
            </div>

            {/* ── Cover image ── */}
            <div className="booking__field" style={fieldStyle}>
              <label>{t.trips.imageLabel}</label>
              <input
                type="file"
                accept="image/*"
                ref={coverFileRef}
                onChange={handleCoverUpload}
                style={{ display: 'none' }}
                id="trip-cover-upload"
              />
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <label htmlFor="trip-cover-upload" className="btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                  {uploadingCover ? t.common.uploading : t.common.upload}
                </label>
                {form.coverImage && (
                  <>
                    <img
                      src={form.coverImage}
                      alt=""
                      style={{ height: 56, width: 100, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--color-border)' }}
                    />
                    <button
                      type="button"
                      className="btn-outline btn-sm"
                      onClick={() => { setForm((p) => ({ ...p, coverImage: '' })); if (coverFileRef.current) coverFileRef.current.value = ''; }}
                      style={{ color: 'var(--color-error, #e53)' }}
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="booking__field" style={fieldStyle}>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  className="admin-toggle__input"
                  checked={form.active}
                  onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                />
                <span className="admin-toggle__track">
                  <span className="admin-toggle__knob" />
                </span>
                <span className="admin-toggle__label">{t.trips.activeLabel}</span>
              </label>
            </div>
          </div>

          {/* ── Gallery (edit only) ── */}
          {editId && (
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {t.gallery.title}
              </label>
              {editGallery.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {editGallery.map((img) => (
                    <div key={img.id} style={{ position: 'relative', width: 80, height: 60 }}>
                      <img
                        src={img.url}
                        alt={img.alt ?? ''}
                        style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--color-border)', display: 'block' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(img.id)}
                        title={t.gallery.deletePhoto}
                        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: 2, cursor: 'pointer', fontSize: 10, lineHeight: 1, padding: '2px 4px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input type="file" accept="image/*" multiple ref={galleryFileRef} onChange={handleGalleryUpload} style={{ display: 'none' }} id="trip-gallery-upload" />
              <label htmlFor="trip-gallery-upload" className="btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                {uploadingGallery ? t.common.uploading : `+ ${t.gallery.addPhoto}`}
              </label>
            </div>
          )}

          {/* ── Videos (edit only) ── */}
          {editId && (
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                Videá (reels) — max 25 MB · mp4 / webm
              </label>
              {editVideos.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  {editVideos.map((vid) => (
                    <div key={vid.id} style={{ position: 'relative', width: 80 }}>
                      <video
                        src={vid.url}
                        style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--color-border)', display: 'block', background: '#000' }}
                        muted
                        playsInline
                      />
                      <button
                        type="button"
                        onClick={() => removeVideo(vid.id)}
                        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: 2, cursor: 'pointer', fontSize: 10, lineHeight: 1, padding: '2px 4px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input type="file" accept="video/mp4,video/webm,video/quicktime" ref={videoFileRef} onChange={handleVideoUpload} style={{ display: 'none' }} id="trip-video-upload" />
              <label htmlFor="trip-video-upload" className="btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                {uploadingVideo ? t.common.uploading : '+ Pridať video'}
              </label>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-primary btn-sm" disabled={saving || uploadingCover || uploadingGallery || uploadingVideo}>
              {saving ? t.common.saving : t.trips.saveBtn}
            </button>
            <button type="button" className="btn-outline btn-sm" onClick={cancelForm}>
              {t.trips.cancelBtn}
            </button>
          </div>
        </form>
      )}

      <div className="admin-services__list">
        {trips.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>{t.trips.noTrips}</p>
        ) : trips.map((trip) => (
          <div
            key={trip.id}
            className={`admin-services__item${trip.active ? '' : ' admin-services__item--inactive'}`}
          >
            {trip.coverImage && (
              <img
                src={trip.coverImage}
                alt={getTripName(trip)}
                style={{ width: 72, height: 50, objectFit: 'cover', borderRadius: 4, flexShrink: 0, border: '1px solid var(--color-border)' }}
              />
            )}
            <div className="admin-services__item-info" style={{ flex: 1 }}>
              <strong>{getTripName(trip)}</strong>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                {new Date(trip.dateStart).toLocaleDateString('sk-SK')}
                {trip.dateEnd && ` – ${new Date(trip.dateEnd).toLocaleDateString('sk-SK')}`}
                {' · '}
                {trip.price} {trip.currency}
                {trip.prepayment != null && ` · záloha ${trip.prepayment} €`}
                {trip.maxSeats != null && ` · ${trip.bookedSeats}/${trip.maxSeats}`}
                {trip.galleryImages.length > 0 && ` · ${trip.galleryImages.length} foto`}
                {trip.videos.length > 0 && ` · ${trip.videos.length} video`}
              </span>
            </div>
            <div className="admin-services__item-actions">
              <button type="button" className="btn-outline btn-sm" onClick={() => startEdit(trip)} disabled={editId === trip.id}>
                {t.common.edit}
              </button>
              <button type="button" className="btn-outline btn-sm" onClick={() => toggleActive(trip)}>
                {trip.active ? t.common.hide : t.common.show}
              </button>
              <button type="button" className="btn-outline btn-sm" style={{ color: 'var(--color-error, #e53)' }} onClick={() => remove(trip)}>
                {t.common.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
