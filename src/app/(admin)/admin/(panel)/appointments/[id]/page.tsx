'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StatusBadge from '@/components/ui/StatusBadge';
import type { AppointmentStatus } from '@/lib/types';

interface AppointmentDetail {
  id: string;
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  date: string;
  timeSlot: string;
  duration: number;
  status: AppointmentStatus;
  note: string | null;
  internalNote: string | null;
  service: { nameKey: string; price: number; duration: number };
  master: { name: string; role: string } | null;
}

const STATUSES: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<AppointmentDetail | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/appointments/${id}`)
      .then((r) => r.json())
      .then(({ appointment }: { appointment: AppointmentDetail }) => {
        setData(appointment);
        setInternalNote(appointment.internalNote ?? '');
      });
  }, [id]);

  async function updateStatus(status: AppointmentStatus) {
    setSaving(true);
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    router.refresh();
    setData((d) => d ? { ...d, status } : d);
  }

  async function saveNote() {
    setSaving(true);
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internalNote }),
    });
    setSaving(false);
  }

  if (!data) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: 640 }}>
      <a href="/admin/appointments" style={{ color: 'var(--color-primary)', fontSize: '0.85rem' }}>
        ← Back to appointments
      </a>

      <h1 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
        Appointment — {data.guestName ?? 'Guest'}
      </h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => updateStatus(s)}
            disabled={saving || data.status === s}
            style={{
              padding: '0.4rem 1rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: data.status === s ? 'default' : 'pointer',
              opacity: data.status === s ? 1 : 0.6,
              background: data.status === s ? 'var(--color-primary)' : 'var(--color-surface)',
              color: data.status === s ? '#fff' : 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
        {[
          ['Status',   <StatusBadge key="s" status={data.status} />],
          ['Service',  data.service.nameKey],
          ['Master',   data.master?.name ?? 'Any'],
          ['Date',     new Date(data.date).toLocaleDateString('sk-SK')],
          ['Time',     data.timeSlot],
          ['Duration', `${data.duration} min`],
          ['Phone',    data.guestPhone ?? '—'],
          ['Email',    data.guestEmail ?? '—'],
          ['Note',     data.note ?? '—'],
        ].map(([label, value]) => (
          <tr key={String(label)} style={{ borderBottom: '1px solid var(--color-border)' }}>
            <td style={{ padding: '0.5rem 0', color: 'var(--color-text-muted)', width: 120, fontSize: '0.85rem' }}>{label}</td>
            <td style={{ padding: '0.5rem 0' }}>{value}</td>
          </tr>
        ))}
      </table>

      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>
          Internal Note
        </label>
        <textarea
          value={internalNote}
          onChange={(e) => setInternalNote(e.target.value)}
          className="form-textarea"
          style={{ width: '100%', marginBottom: '0.75rem' }}
        />
        <button
          onClick={saveNote}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}
