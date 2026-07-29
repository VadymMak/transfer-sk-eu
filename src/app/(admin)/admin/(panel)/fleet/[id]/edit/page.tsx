'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';

interface VehicleMeta {
  capacity?: string;
  luggage?: string;
}

interface Vehicle {
  id: string;
  nameKey: string;
  description: string | null;
  image: string | null;
  metadata: VehicleMeta | null;
  active: boolean;
  sortOrder: number;
}

export default function EditVehiclePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { locale } = useAdminLocale();
  const t = getAdminT(locale);

  const [form, setForm] = useState({ nameKey: '', description: '', capacity: '', luggage: '' });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/admin/fleet')
      .then((r) => r.json() as Promise<Vehicle[]>)
      .then((vehicles) => {
        const v = vehicles.find((x) => x.id === id);
        if (v) {
          setForm({
            nameKey: v.nameKey,
            description: v.description ?? '',
            capacity: v.metadata?.capacity ?? '',
            luggage: v.metadata?.luggage ?? '',
          });
          setCurrentImage(v.image ?? null);
          setActive(v.active);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nameKey.trim()) return;
    setSaving(true);
    setError('');

    let imageUrl: string | null | undefined = undefined;

    const file = fileRef.current?.files?.[0];
    if (file) {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('purpose', 'fleet');
      const up = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      setUploading(false);
      if (!up.ok) {
        const d = await up.json() as { error?: string };
        setError(d.error ?? t.fleet.imageUploadError);
        setSaving(false);
        return;
      }
      const { url } = await up.json() as { url: string };
      imageUrl = url;
    }

    const body: Record<string, unknown> = {
      nameKey: form.nameKey,
      description: form.description || null,
      active,
      metadata: {
        capacity: form.capacity || undefined,
        luggage: form.luggage || undefined,
      },
    };
    if (imageUrl !== undefined) body.image = imageUrl;

    const res = await fetch(`/api/admin/fleet/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push('/admin/fleet');
    } else {
      const data = await res.json() as { error?: string };
      setError(data.error ?? t.hero.saveError);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <p style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>{t.common.loading}</p>
      </div>
    );
  }

  const displayImage = preview ?? currentImage;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>{t.fleet.editTitle}</h1>
        <Link href="/admin/fleet" className="btn-outline btn-sm">{t.fleet.backLink}</Link>
      </div>

      <form onSubmit={submit} className="admin-masters__form">
        <div className="admin-services__form-grid">
          <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
            <label>{t.fleet.nameLabel} *</label>
            <input
              value={form.nameKey}
              onChange={(e) => setForm((p) => ({ ...p, nameKey: e.target.value }))}
              required
            />
          </div>

          <div className="booking__field">
            <label>{t.fleet.capacityLabel}</label>
            <input
              value={form.capacity}
              onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
              placeholder="4"
            />
          </div>

          <div className="booking__field">
            <label>{t.fleet.luggageLabel}</label>
            <input
              value={form.luggage}
              onChange={(e) => setForm((p) => ({ ...p, luggage: e.target.value }))}
              placeholder="3 Koffer"
            />
          </div>

          <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
            <label>{t.fleet.imageLabel}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {displayImage && (
                <img
                  src={displayImage}
                  alt="preview"
                  style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--color-border)', flexShrink: 0 }}
                />
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ color: 'var(--color-text-secondary, #b0a898)' }}
              />
            </div>
          </div>

          <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
            <label>{t.fleet.descriptionLabel}</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          <span style={{ color: 'var(--color-text-secondary)' }}>{t.fleet.active}</span>
        </label>

        {error && (
          <p style={{ color: 'var(--color-error, #ef4444)', marginTop: '0.5rem' }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            type="submit"
            className="btn-primary btn-sm"
            disabled={saving || uploading || !form.nameKey.trim()}
          >
            {uploading ? t.common.uploading : saving ? t.common.saving : t.common.save}
          </button>
          <Link href="/admin/fleet" className="btn-outline btn-sm">{t.common.cancel}</Link>
        </div>
      </form>
    </div>
  );
}
