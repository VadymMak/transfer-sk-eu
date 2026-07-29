import type { AppointmentStatus } from '@/lib/types';

const LABEL: Record<AppointmentStatus, string> = {
  PENDING:   'Čaká',
  CONFIRMED: 'Potvrdené',
  CANCELLED: 'Zrušené',
  COMPLETED: 'Dokončené',
  NO_SHOW:   'Nedostavil sa',
};

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`badge badge--${status.toLowerCase()}`}>
      {LABEL[status]}
    </span>
  );
}
