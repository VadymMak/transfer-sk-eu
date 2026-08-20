'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';
import AdminLoading from '@/components/admin/AdminLoading/AdminLoading';

const TRIP_LOCALES = ['sk', 'cs', 'de', 'en', 'ru', 'uk'] as const;
type TripLocale = (typeof TRIP_LOCALES)[number];

interface TripTranslation {
  locale: string;
  name: string;
  description: string | null;
  itinerary: string | null;
}

interface TripGalleryImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

interface Trip {
  id: string;
  slug: string;
  coverImage: string | null;
  dateStart: string;
  dateEnd: string | null;
  price: number;
  currency: string;
  maxSeats: number | null;
  bookedSeats: number;
  active: boolean;
  sortOrder: number;
  translations: TripTranslation[];
  galleryImages: TripGalleryImage[];
}

type TranslationDraft = Record<TripLocale, { name: string; description: string; itinerary: string }>;

function emptyTranslations(): TranslationDraft {
  return Object.fromEntries(
    TRIP_LOCALES.map((l) => [l, { name: '', description: '', itinerary: '' }]),
  ) as TranslationDraft;
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
  const [activeLocaleTab, setActiveLocaleTab] = useState<TripLocale>('sk');
  const coverFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  // Current gallery images while editing (reflects server state + pending removals)
  const [editGallery, setEditGallery] = useState<TripGalleryImage[]>([]);

  const [form, setForm] = useState({
    dateStart: '',
    dateEnd: '',
    price: 0,
    maxSeats: '',
    coverImage: '',
    active: true,
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
    setForm({ dateStart: '', dateEnd: '', price: 0, maxSeats: '', coverImage: '', active: true });
    setTranslations(emptyTranslations());
    setActiveLocaleTab('sk');
    setEditGallery([]);
    if (coverFileRef.current) coverFileRef.current.value = '';
    if (galleryFileRef.current) galleryFileRef.current.value = '';
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
        };
      }
    }
    setForm({
      dateStart: toDateInput(trip.dateStart),
      dateEnd: trip.dateEnd ? toDateInput(trip.dateEnd) : '',
      price: trip.price,
      maxSeats: trip.maxSeats != null ? String(trip.maxSeats) : '',
      coverImage: trip.coverImage ?? '',
      active: trip.active,
    });
    setTranslations(draft);
    setEditGallery(trip.galleryImages ?? []);
    setActiveLocaleTab('sk');
    setEditId(trip.id);
    setShowAdd(false);
  }

  function cancelForm() {
    setEditId(null);
    setShowAdd(false);
    resetForm();
  }

  // Upload cover via purpose=trips → Vercel Blob → store -cover variant URL
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

  // Upload gallery images via purpose=gallery → Vercel Blob → PATCH galleryAdd
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
      maxSeats: form.maxSeats ? Number(form.maxSeats) : undefined,
      active: form.active,
      translations: TRIP_LOCALES
        .filter((l) => translations[l].name.trim())
        .map((l) => ({
          locale: l,
          name: translations[l].name,
          description: translations[l].description || undefined,
          itinerary: translations[l].itinerary || undefined,
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

          {/* ── Translation fields ── */}
          <div className="admin-services__form-grid">
            <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
              <label>{t.trips.nameLabel} ({activeLocaleTab.toUpperCase()}) *</label>
              <input
                value={translations[activeLocaleTab].name}
                onChange={(e) => setTranslations((p) => ({
                  ...p,
                  [activeLocaleTab]: { ...p[activeLocaleTab], name: e.target.value },
                }))}
                placeholder={t.trips.nameLabel}
              />
            </div>
            <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
              <label>{t.trips.descriptionLabel} ({activeLocaleTab.toUpperCase()})</label>
              <textarea
                rows={3}
                value={translations[activeLocaleTab].description}
                onChange={(e) => setTranslations((p) => ({
                  ...p,
                  [activeLocaleTab]: { ...p[activeLocaleTab], description: e.target.value },
                }))}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
              <label>{t.trips.itineraryLabel} ({activeLocaleTab.toUpperCase()})</label>
              <textarea
                rows={4}
                value={translations[activeLocaleTab].itinerary}
                onChange={(e) => setTranslations((p) => ({
                  ...p,
                  [activeLocaleTab]: { ...p[activeLocaleTab], itinerary: e.target.value },
                }))}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* ── Scalar fields ── */}
          <div className="admin-services__form-grid" style={{ marginTop: '1rem' }}>
            <div className="booking__field">
              <label>{t.trips.dateStartLabel} *</label>
              <input
                type="date"
                value={form.dateStart}
                onChange={(e) => setForm((p) => ({ ...p, dateStart: e.target.value }))}
                required
              />
            </div>
            <div className="booking__field">
              <label>{t.trips.dateEndLabel}</label>
              <input
                type="date"
                value={form.dateEnd}
                onChange={(e) => setForm((p) => ({ ...p, dateEnd: e.target.value }))}
              />
            </div>
            <div className="booking__field">
              <label>{t.trips.priceLabel} *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="booking__field">
              <label>{t.trips.maxSeatsLabel}</label>
              <input
                type="number"
                min="1"
                value={form.maxSeats}
                onChange={(e) => setForm((p) => ({ ...p, maxSeats: e.target.value }))}
              />
            </div>

            {/* ── Cover image — uploads via purpose=trips → Vercel Blob ── */}
            <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
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
                      onClick={() => {
                        setForm((p) => ({ ...p, coverImage: '' }));
                        if (coverFileRef.current) coverFileRef.current.value = '';
                      }}
                      style={{ color: 'var(--color-error, #e53)' }}
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                Stored via Vercel Blob · purpose=trips · 1600×900 webp
              </p>
            </div>

            <div className="booking__field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                />
                {t.trips.activeLabel}
              </label>
            </div>
          </div>

          {/* ── Gallery images — only shown when editing an existing trip ── */}
          {editId && (
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {t.gallery.title}
                <span style={{ marginLeft: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                  purpose=gallery · Vercel Blob
                </span>
              </label>

              {/* Existing gallery images */}
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
                        style={{
                          position: 'absolute', top: 2, right: 2,
                          background: 'rgba(0,0,0,0.6)', border: 'none',
                          color: '#fff', borderRadius: 2, cursor: 'pointer',
                          fontSize: 10, lineHeight: 1, padding: '2px 4px',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload new gallery images */}
              <input
                type="file"
                accept="image/*"
                multiple
                ref={galleryFileRef}
                onChange={handleGalleryUpload}
                style={{ display: 'none' }}
                id="trip-gallery-upload"
              />
              <label htmlFor="trip-gallery-upload" className="btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                {uploadingGallery ? t.common.uploading : `+ ${t.gallery.addPhoto}`}
              </label>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-primary btn-sm" disabled={saving || uploadingCover || uploadingGallery}>
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
                {trip.maxSeats != null && ` · ${trip.bookedSeats}/${trip.maxSeats}`}
                {trip.galleryImages.length > 0 && ` · ${trip.galleryImages.length} foto`}
              </span>
            </div>
            <div className="admin-services__item-actions">
              <button
                type="button"
                className="btn-outline btn-sm"
                onClick={() => startEdit(trip)}
                disabled={editId === trip.id}
              >
                {t.common.edit}
              </button>
              <button
                type="button"
                className="btn-outline btn-sm"
                onClick={() => toggleActive(trip)}
              >
                {trip.active ? t.common.hide : t.common.show}
              </button>
              <button
                type="button"
                className="btn-outline btn-sm"
                style={{ color: 'var(--color-error, #e53)' }}
                onClick={() => remove(trip)}
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
