'use client';

import { useTranslations } from 'next-intl';
import { useVerticalConfig } from '@/lib/vertical-context';
import styles from './HowItWorksSection.module.css';

const ICONS = {
  ECOMMERCE: {
    step1: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
        <path d="M8 11h6" />
        <path d="M11 8v6" />
      </svg>
    ),
    step2: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        <path d="M6 10h.01" />
        <path d="M18 10h.01" />
        <path d="M6 14h.01" />
        <path d="M18 14h.01" />
      </svg>
    ),
    step3: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
  FOOD_MARKET: {
    step1: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
    step2: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <path d="M21 11.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6.5" />
        <path d="M3 10h18" />
        <circle cx="18" cy="18" r="4" />
        <path d="M18 16.5V18l1 1" />
      </svg>
    ),
    step3: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
  SHOE_MARKET: {
    step1: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
    step2: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
    step3: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
} as const;

type SupportedVertical = keyof typeof ICONS;

export default function HowItWorksSection() {
  const t = useTranslations('howItWorks');
  const vConfig = useVerticalConfig();

  const vertical = vConfig.vertical as string;
  if (!(vertical in ICONS)) return null;

  const icons = ICONS[vertical as SupportedVertical];

  const prefix = vertical === 'SHOE_MARKET' ? 'shoe_' : vertical === 'FOOD_MARKET' ? 'food_' : '';
  const tv = (key: string) => {
    const prefixed = `${prefix}${key}`;
    return prefix && t.has(prefixed) ? t(prefixed) : t(key);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>{t('label')}</span>
          <h2 className={styles.title}>{tv('title')}</h2>
          <p className={styles.subtitle}>{tv('subtitle')}</p>
        </div>

        <div className={styles.steps}>
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className={styles.step}>
              <div className={styles.stepIcon}>
                {icons[`step${n}` as keyof typeof icons]}
                <span className={styles.stepBadge}>{n}</span>
              </div>
              <h3 className={styles.stepTitle}>{tv(`step${n}Title`)}</h3>
              <p className={styles.stepDesc}>{tv(`step${n}Desc`)}</p>
            </div>
          ))}
        </div>

        <div className={styles.pills}>
          {([1, 2, 3] as const).map((n) => (
            <span key={n} className={styles.pill}>
              <span className={styles.pillCheck}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              {tv(`pill${n}`)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
