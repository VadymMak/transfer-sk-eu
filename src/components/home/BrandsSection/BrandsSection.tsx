'use client';

import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useVerticalConfig } from '@/lib/vertical-context';
import styles from './BrandsSection.module.css';

export interface BrandsSectionProps {
  onBrandClick?: (brand: string) => void;
}

/* ── Brand data per vertical ─────────────────────────────────── */

interface BrandItem {
  id: string;
  cardClass?: string;
  logo: ReactNode;
}

const ECOMMERCE_BRANDS: BrandItem[] = [
  { id: 'makita', logo: <span className={`${styles.logo} ${styles.logoMakita}`}>MAKITA</span> },
  { id: 'bosch', logo: <span className={`${styles.logo} ${styles.logoBosch}`}>BOSCH</span> },
  {
    id: 'dewalt',
    cardClass: styles.cardDewalt,
    logo: (
      <span className={`${styles.logo} ${styles.logoDewalt}`}>
        De<b>WALT</b>
      </span>
    ),
  },
  { id: 'milwaukee', logo: <span className={`${styles.logo} ${styles.logoMilwaukee}`}>Milwaukee</span> },
  { id: 'metabo', logo: <span className={`${styles.logo} ${styles.logoMetabo}`}>Metabo</span> },
];

const SHOE_BRANDS: BrandItem[] = [
  { id: 'nike', logo: <span className={`${styles.logo} ${styles.logoNike}`}>NIKE</span> },
  { id: 'adidas', logo: <span className={`${styles.logo} ${styles.logoAdidas}`}>adidas</span> },
  { id: 'new-balance', logo: <span className={`${styles.logo} ${styles.logoNewBalance}`}>New Balance</span> },
  { id: 'puma', logo: <span className={`${styles.logo} ${styles.logoPuma}`}>PUMA</span> },
  { id: 'asics', logo: <span className={`${styles.logo} ${styles.logoAsics}`}>ASICS</span> },
  { id: 'hoka', logo: <span className={`${styles.logo} ${styles.logoHoka}`}>HOKA</span> },
  { id: 'converse', logo: <span className={`${styles.logo} ${styles.logoConverse}`}>CONVERSE</span> },
  { id: 'vans', logo: <span className={`${styles.logo} ${styles.logoVans}`}>VANS</span> },
];

function getBrandsForVertical(vertical: string): BrandItem[] {
  switch (vertical) {
    case 'SHOE_MARKET':
      return SHOE_BRANDS;
    default:
      return ECOMMERCE_BRANDS;
  }
}

/* ── Component ───────────────────────────────────────────────── */

export default function BrandsSection({ onBrandClick }: BrandsSectionProps) {
  const t = useTranslations('home');
  const vConfig = useVerticalConfig();
  const brands = getBrandsForVertical(vConfig.vertical);
  const isShoe = vConfig.vertical === 'SHOE_MARKET';

  return (
    <section className={styles.section}>
      <div className={styles.wrap}>
        {/* Title row */}
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{t('popularBrands')}</h2>
          <Link href="/catalog?tab=brands" className={styles.viewAll}>
            {t('viewAll')} →
          </Link>
        </div>

        {/* Grid / Row */}
        <div className={isShoe ? styles.shoeGrid : styles.row}>
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/catalog?brand=${brand.id}`}
              className={`${styles.card} ${brand.cardClass ?? ''} ${isShoe ? styles.cardShoe : ''}`}
              onClick={() => onBrandClick?.(brand.id)}
            >
              {brand.logo}
            </Link>
          ))}
        </div>

        <p className={styles.foot}>{t('officialDealer')}</p>
      </div>
    </section>
  );
}
