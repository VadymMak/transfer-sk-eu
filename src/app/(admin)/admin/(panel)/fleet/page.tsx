'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminLoading from '@/components/admin/AdminLoading/AdminLoading';
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

export default function FleetAdminPage() {
  const { locale } = useAdminLocale();
  const t = getAdminT(locale);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/fleet');
    if (r.ok) setVehicles(await r.json() as Vehicle[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function remove(id: string, name: string) {
    if (!window.confirm(t.fleet.deleteConfirm.replace('{name}', name))) return;
    await fetch(`/api/admin/fleet/${id}`, { method: 'DELETE' });
    await load();
  }

  async function toggleActive(v: Vehicle) {
    await fetch(`/api/admin/fleet/${v.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !v.active }),
    });
    await load();
  }

  if (loading) return <AdminLoading rows={3} />;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>{t.fleet.title}</h1>
        <Link href="/admin/fleet/new" className="btn-primary btn-sm">{t.fleet.add}</Link>
      </div>

      <div className="admin-services__list">
        {vehicles.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>
            {t.fleet.noVehicles}
          </p>
        ) : vehicles.map((v) => (
          <div
            key={v.id}
            className={`admin-services__item${v.active ? '' : ' admin-services__item--inactive'}`}
          >
            {v.image ? (
              <img
                src={v.image}
                alt={v.nameKey}
                style={{ width: 56, height: 44, objectFit: 'cover', borderRadius: 4, flexShrink: 0, border: '1px solid var(--color-border)' }}
              />
            ) : (
              <div style={{ width: 56, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 4, flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h11l4 4v4a2 2 0 0 1-2 2h-1" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </div>
            )}

            <div className="admin-services__info">
              <span className="admin-services__name">{v.nameKey}</span>
              {v.metadata?.capacity && (
                <span className="admin-services__desc">{t.fleet.capacityLabel}: {v.metadata.capacity}</span>
              )}
              {v.description && (
                <span className="admin-services__meta">{v.description}</span>
              )}
            </div>

            <div className="admin-services__actions">
              <button
                type="button"
                className={`btn-sm ${v.active ? 'btn-outline' : 'btn-primary'}`}
                onClick={() => toggleActive(v)}
              >
                {v.active ? t.common.hide : t.common.show}
              </button>
              <Link href={`/admin/fleet/${v.id}/edit`} className="btn-sm btn-outline">
                {t.common.edit}
              </Link>
              <button
                type="button"
                className="btn-sm btn-danger"
                onClick={() => remove(v.id, v.nameKey)}
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
