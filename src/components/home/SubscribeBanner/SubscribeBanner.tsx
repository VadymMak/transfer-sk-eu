'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './SubscribeBanner.module.css';

export interface SubscribeBannerProps {
  /** Called with the submitted email. Defaults to a console.log placeholder. */
  onSubscribe?: (email: string) => void;
}

function SparkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
      <path d="M12 2l1.8 4.7L18.5 8l-4.7 1.8L12 14.5l-1.8-4.7L5.5 8l4.7-1.3L12 2Z" />
      <path d="M18.5 13l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9.9-2.3Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3 6 9 6 9-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function SubscribeBanner({ onSubscribe }: SubscribeBannerProps) {
  const t = useTranslations('subscribe');
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    (onSubscribe ?? ((value: string) => console.log('[subscribe]', value)))(email);
    setDone(true);
  };

  return (
    <section className={styles.sub}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <h2 className={styles.title}>
            <SparkIcon />
            <span>{t('title')}</span>
          </h2>
          <p className={styles.subtitle}>{t('subtitle')}</p>
        </div>

        <div>
          <form className={styles.form} onSubmit={handleSubmit}>
            <span className={styles.field}>
              <MailIcon />
              <input
                className={styles.input}
                type="email"
                placeholder={t('placeholder')}
                aria-label={t('placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </span>
            <button type="submit" className={`${styles.btn} ${done ? styles.btnDone : ''}`}>
              {done ? t('done') : t('button')}
            </button>
          </form>
          {done && (
            <p className={styles.note}>
              <CheckIcon />
              {t('note')}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
