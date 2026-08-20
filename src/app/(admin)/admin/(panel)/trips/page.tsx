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
  const [uploading, setUploading] = useState(false);
  const [activeLocaleTab, setActiveLocaleTab] = useState<TripLocale>('sk');
  const fileRef = useRef<HTMLInputElement>(null);

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
    if (fileRef.current) fileRef.current.value = '';
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
    setActiveLocaleTab('sk');
    setEditId(trip.id);
    setShowAdd(false);
  }

  function cancelForm() {
    setEditId(null);
    setShowAdd(false);
    resetForm();
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('purpose', 'trips');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    setUploading(false);
    if (res.ok) {
      const { url } = await res.json() as { url: string };
      setForm((p) => ({ ...p, coverImage: url }));
    } else {
      alert(t.trips.imageUploadError);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const hasName = TRIP_LOCALES.some((l) => translations[l].name.trim());
    if (!hasName || !form.dateStart || !form.price) return;
    setSaving(true);

    const payload = {
      coverImage: form.coverImage || undefined,
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

          {/* Locale tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
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

          {/* Translation fields for active locale */}
          <div className="admin-services__form-grid">
            <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
              <label>{t.trips.nameLabel} ({activeLocaleTab.toUpperCase()}) *</label>
              <input
                value={translations[activeLocaleTab].name}
                onChange={(e) => setTranslations((p) => ({ ...p, [activeLocaleTab]: { ...p[activeLocaleTab], name: e.target.value } }))}
                placeholder={t.trips.nameLabel}
              />
            </div>
            <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
              <label>{t.trips.descriptionLabel} ({activeLocaleTab.toUpperCase()})</label>
              <textarea
                rows={3}
                value={translations[activeLocaleTab].description}
                onChange={(e) => setTranslations((p) => ({ ...p, [activeLocaleTab]: { ...p[activeLocaleTab], description: e.target.value } }))}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
              <label>{t.trips.itineraryLabel} ({activeLocaleTab.toUpperCase()})</label>
              <textarea
                rows={4}
                value={translations[activeLocaleTab].itinerary}
                onChange={(e) => setTranslations((p) => ({ ...p, [activeLocaleTab]: { ...p[activeLocaleTab], itinerary: e.target.value } }))}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Scalar fields */}
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
            <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
              <label>{t.trips.imageLabel}</label>
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="trip-image-upload"
              />
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <label htmlFor="trip-image-upload" className="btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                  {uploading ? t.common.uploading : t.common.upload}
                </label>
                {form.coverImage && (
                  <img src={form.coverImage} alt="" style={{ height: 48, width: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--color-border)' }} />
                )}
              </div>
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

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-primary btn-sm" disabled={saving || uploading}>
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
                style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 4, flexShrink: 0, border: '1px solid var(--color-border)' }}
              />
            )}
            <div className="admin-services__item-info" style={{ flex: 1 }}>
              <strong>{getTripName(trip)}</strong>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                {new Date(trip.dateStart).toLocaleDateString('sk-SK')}
                {trip.dateEnd && ` – ${new Date(trip.dateEnd).toLocaleDateString('sk-SK')}`}
                {' · '}
                {trip.price} {trip.currency}
                {trip.maxSeats != null && ` · ${trip.bookedSeats}/${trip.maxSeats} miest`}
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
