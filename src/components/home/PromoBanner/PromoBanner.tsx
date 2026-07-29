'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import styles from './PromoBanner.module.css';

export default function PromoBanner() {
  const t = useTranslations('promoBanner');

  return (
    <section className={styles.banner} aria-label={t('label')}>
      <div className={styles.inner}>
        {/* Left — promo text */}
        <div className={styles.textBlock}>
          <span className={styles.label}>{t('label')}</span>
          <h2 className={styles.headline}>{t('headline')}</h2>
          <p className={styles.brands}>{t('brands')}</p>
        </div>

        {/* Center — trust pills */}
        <div className={styles.pills}>
          <span className={styles.pill}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            {t('freeShipping')}
          </span>
          <span className={styles.pill}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            {t('freeReturns')}
          </span>
        </div>

        {/* Right — CTA buttons */}
        <div className={styles.actions}>
          <Link href="/catalog?sale=true" className={styles.btnPrimary}>
            {t('shopSale')} →
          </Link>
          <Link href="/catalog?new=true" className={styles.btnSecondary}>
            {t('newArrivals')}
          </Link>
        </div>
      </div>
    </section>
  );
}
