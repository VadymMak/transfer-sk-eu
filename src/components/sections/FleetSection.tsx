import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import GoldDivider from '@/components/ui/GoldDivider';
import ScrollReveal from '@/components/ui/ScrollReveal';

interface FleetVehicle {
  id: string;
  nameKey: string;
  description: string | null;
  image: string | null;
  metadata?: unknown;
}

interface VehicleMeta {
  capacity?: string;
  luggage?: string;
  model?: string;
}

interface FleetSectionProps {
  fleet: FleetVehicle[];
}

export default async function FleetSection({ fleet }: FleetSectionProps) {
  const t = await getTranslations('fleet');

  return (
    <section id="fuhrpark" className="team">
      <ScrollReveal direction="up" className="section-header">
        <p className="section-label">{t('label')}</p>
        <h2 className="section-title">{t('title')}</h2>
        <GoldDivider />
        <p className="section-subtitle">{t('subtitle')}</p>
      </ScrollReveal>

      <div className="team-grid">
        {fleet.map((vehicle, i) => {
          const meta = (vehicle.metadata as VehicleMeta) ?? {};

          return (
            <ScrollReveal key={vehicle.id} direction="up" delay={i * 120}>
              <div className="team-card">
                <div className="team-photo-container">
                  {vehicle.image ? (
                    <Image
                      src={vehicle.image}
                      alt={vehicle.nameKey}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="team-photo"
                      unoptimized={vehicle.image.startsWith('http')}
                    />
                  ) : (
                    <div className="fleet-placeholder">
                      <svg
                        width="80"
                        height="80"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h11l4 4v4a2 2 0 0 1-2 2h-1" />
                        <circle cx="7" cy="17" r="2" />
                        <circle cx="17" cy="17" r="2" />
                      </svg>
                    </div>
                  )}
                </div>

                <h3 className="team-name">{vehicle.nameKey}</h3>

                {meta.capacity && (
                  <p className="team-role">
                    {t('capacityLabel')}: {meta.capacity}
                  </p>
                )}

                {(meta.luggage || meta.model) && (
                  <p className="team-exp">
                    {meta.luggage && `${t('luggageLabel')}: ${meta.luggage}`}
                    {meta.luggage && meta.model && ' · '}
                    {meta.model && `${t('modelLabel')}: ${meta.model}`}
                  </p>
                )}

                {vehicle.description && (
                  <p className="team-exp">{vehicle.description}</p>
                )}
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
