'use client';

import { useTranslations } from 'next-intl';
import styles from './DeliveryZonesSection.module.css';

export interface ZoneData {
  id: string;
  name: string;
  fee: number;
  minOrder: number;
  estimatedMin: number;
  estimatedMax: number;
}

interface DeliveryZonesSectionProps {
  zones: ZoneData[];
  currency: string;
  defaultMinOrder: number;
}

function BikeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5" cy="18" r="3" />
      <circle cx="19" cy="18" r="3" />
      <path d="M7.5 18h5l1-6h4l2 6" />
      <path d="M12 18V9l-4-2" />
    </svg>
  );
}

export default function DeliveryZonesSection({ zones, currency, defaultMinOrder }: DeliveryZonesSectionProps) {
  const t = useTranslations('deliveryZones');

  if (!zones.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('title')}</h2>
        </div>

        <div className={styles.grid}>
          {zones.map((zone) => (
            <div key={zone.id} className={styles.card}>
              <div className={styles.cardIcon}>
                <BikeIcon />
              </div>
              <div className={styles.cardBody}>
                <p className={styles.zoneName}>{zone.name}</p>
                <p className={styles.fee}>
                  {zone.fee === 0
                    ? t('free')
                    : `${t('from')} ${zone.fee} ${currency}`}
                </p>
                <p className={styles.minOrder}>
                  {t('minOrder')}: {zone.minOrder} {currency}
                </p>
                <p className={styles.time}>
                  {t('delivery')}: {zone.estimatedMin}–{zone.estimatedMax} {t('minutes')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {defaultMinOrder > 0 && (
          <div className={styles.freeDeliveryBanner}>
            {t('freeFrom', { amount: defaultMinOrder, currency })}
          </div>
        )}
      </div>
    </section>
  );
}
