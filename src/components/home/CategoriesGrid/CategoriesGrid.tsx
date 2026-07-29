'use client';

import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useVerticalConfig } from '@/lib/vertical-context';
import styles from './CategoriesGrid.module.css';

// ── ECOMMERCE: power-tool categories ────────────────────────────

/** Stable identifiers for each category — also the translation keys under `categories`. */
export type CategoryId =
  | 'drills'
  | 'grinders'
  | 'perforators'
  | 'jigsaws'
  | 'sanders'
  | 'lasers'
  | 'measuring'
  | 'accessories';

const CATEGORIES: { id: CategoryId; icon: ReactNode }[] = [
  {
    id: 'drills',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="8" width="11" height="7" rx="1.5" />
        <path d="M13 10h3l4-1v6l-4-1h-3" />
        <path d="M5 15v3h4v-3" />
        <path d="M20 11h2M20 13h2" />
      </svg>
    ),
  },
  {
    id: 'grinders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="12" r="5" />
        <path d="M7 9.5v5" />
        <rect x="13" y="9" width="8" height="6" rx="1.5" />
        <path d="M12 12h1" />
      </svg>
    ),
  },
  {
    id: 'perforators',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="9" height="7" rx="1.5" />
        <path d="M12 10h4l3-1v5l-3-1h-4" />
        <path d="M6 15v3h3v-3" />
        <path d="M20 4v3M22.5 4v3M20 9v2" />
      </svg>
    ),
  },
  {
    id: 'jigsaws',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h11v8H4z" />
        <circle cx="7" cy="9" r="1.5" />
        <path d="M9.5 13l-1.2 2 1.2 2-1.2 2" />
      </svg>
    ),
  },
  {
    id: 'sanders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="8" width="14" height="7" rx="1.5" />
        <path d="M8 8V5h6v3" />
        <path d="M4 19c2.5 1.2 4.5-1.2 7 0s4.5 1.2 7 0" />
      </svg>
    ),
  },
  {
    id: 'lasers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        <path d="M5.5 5.5 8 8M18.5 5.5 16 8M5.5 18.5 8 16M18.5 18.5 16 16" />
      </svg>
    ),
  },
  {
    id: 'measuring',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="7" width="19" height="10" rx="1.5" />
        <path d="M7 7v3M11 7v4M15 7v3M19 7v4" />
      </svg>
    ),
  },
  {
    id: 'accessories',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
      </svg>
    ),
  },
];

// ── SHOE MARKET: icon + text cards ──────────────────────────────

export type ShoeCategoryId =
  | 'sneakers'
  | 'running'
  | 'boots'
  | 'sandals'
  | 'dress-shoes'
  | 'sport'
  | 'kids'
  | 'sale';

const SHOE_CATEGORIES: { id: ShoeCategoryId; icon: ReactNode; isSale?: boolean }[] = [
  {
    id: 'sneakers',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 32l2-10c.6-3 2.4-5.5 6-6.5 2-.6 4-1 7 0l2 1c3 1.4 6 2 9 2h6c4 0 6 3 6 6v2c0 2-2 4-4 4H6v2" />
        <path d="M6 32h36v2H6v-2z" />
        <circle cx="16" cy="24" r="1.5" />
        <circle cx="22" cy="22" r="1.5" />
      </svg>
    ),
  },
  {
    id: 'running',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 32l2-10c.6-3 2.4-5.5 6-6.5 2-.6 4-1 7 0l2 1c3 1.4 6 2 9 2h6c4 0 6 3 6 6v2c0 2-2 4-4 4H6v2" />
        <path d="M6 32h36v2H6v-2z" />
        <path d="M36 26l4-2M38 24l3-3M34 28l5-1" />
      </svg>
    ),
  },
  {
    id: 'boots',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 10v14H12c-2 0-4 1.5-4 4v6h28v-6c0-2-1-4-3-4h-5V14" />
        <path d="M16 10h12v4H16z" />
        <path d="M8 34h28v4H8z" />
        <path d="M20 18h4" />
        <path d="M20 22h4" />
      </svg>
    ),
  },
  {
    id: 'sandals',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="24" cy="30" rx="12" ry="6" />
        <path d="M24 14v10" />
        <path d="M18 28l6-8 6 8" />
        <circle cx="24" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: 'dress-shoes',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 30l2-8c1-4 4-6 8-6h4c2 0 4 1 5 3l5 7c2 2.5 4 3 6 3h2v4H8v-3z" />
        <path d="M8 30h32v3H8z" />
        <path d="M18 20c1-1 3-1 4 0" />
      </svg>
    ),
  },
  {
    id: 'sport',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 32l2-10c.6-3 2.4-5.5 6-6.5 2-.6 4-1 7 0l2 1c3 1.4 6 2 9 2h6c4 0 6 3 6 6v2c0 2-2 4-4 4H6v2" />
        <path d="M6 32h36v2H6v-2z" />
        <path d="M14 26l4-4 4 4 4-4 4 4" />
      </svg>
    ),
  },
  {
    id: 'kids',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 30l2-8c.5-2.5 2-4.5 5-5.5 1.5-.5 3-.8 5.5 0l1.5.7c2.5 1.2 5 1.7 7.5 1.7h4c3.5 0 5 2.5 5 5v1.5c0 1.7-1.5 3.5-3.5 3.5H10v1" />
        <path d="M10 30h28v2H10v-2z" />
        <path d="M26 11l1.5-3 1.5 3-1.5.8z" />
      </svg>
    ),
  },
  {
    id: 'sale',
    isSale: true,
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 6l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
        <rect x="14" y="24" width="20" height="14" rx="2" />
        <path d="M20 31h8" />
        <path d="M24 28v6" />
        <circle cx="19" cy="31" r="2" />
        <circle cx="29" cy="31" r="2" />
      </svg>
    ),
  },
];

// ── FOOD MARKET: emoji + color-coded cards ───────────────────────

export interface CategoryData {
  slug: string;
  nameKey: string;
  productCount: number;
}

const FOOD_CATEGORY_CONFIG: Record<string, { emoji: string; bgClass: string }> = {
  fruits:     { emoji: '🍓', bgClass: 'foodCatPink' },
  vegetables: { emoji: '🥦', bgClass: 'foodCatGreen' },
  dairy:      { emoji: '🧀', bgClass: 'foodCatBlue' },
  bakery:     { emoji: '🥖', bgClass: 'foodCatYellow' },
  meat:       { emoji: '🐟', bgClass: 'foodCatSalmon' },
  drinks:     { emoji: '🧃', bgClass: 'foodCatCyan' },
  frozen:     { emoji: '🍫', bgClass: 'foodCatLavender' },
  grocery:    { emoji: '🌱', bgClass: 'foodCatMint' },
};

// ── Props ────────────────────────────────────────────────────────

export interface CategoriesGridProps {
  onCategoryClick?: (categoryId: string) => void;
  categories?: CategoryData[];
  storeName?: string;
}

// ── Component ────────────────────────────────────────────────────

export default function CategoriesGrid({ onCategoryClick, categories, storeName }: CategoriesGridProps) {
  const t = useTranslations('categories');
  const vConfig = useVerticalConfig();

  // ── Food Market ─────────────────────────────────────────────────
  if (vConfig.vertical === 'FOOD_MARKET') {
    return (
      <section className={styles.foodCatSection}>
        <div className={styles.foodCatInner}>
          <div className={styles.foodCatHeader}>
            <div>
              <p className={styles.foodCatLabel}>
                <span className={styles.foodCatLabelLine} />
                {storeName}
              </p>
              <h2 className={styles.foodCatTitle}>{t('shopByCategory')}</h2>
              <p className={styles.foodCatSubtitle}>{t('findWhatYouNeed')}</p>
            </div>
            <Link href="/catalog" className={styles.foodCatBrowse}>
              {t('browseAll')} <span>→</span>
            </Link>
          </div>

          <ul className={styles.foodCatGrid}>
            {(categories ?? []).map((cat) => {
              const config = FOOD_CATEGORY_CONFIG[cat.slug];
              return (
                <li key={cat.slug}>
                  <Link
                    href={`/catalog?category=${cat.slug}`}
                    className={`${styles.foodCatCard} ${config ? styles[config.bgClass as keyof typeof styles] : ''}`}
                    onClick={() => onCategoryClick?.(cat.slug)}
                  >
                    <span className={styles.foodCatEmoji} aria-hidden="true">
                      <span className={styles.foodCatEmojiCircle}>
                        {config?.emoji ?? '📦'}
                      </span>
                    </span>
                    <span className={styles.foodCatName}>{t(cat.nameKey as Parameters<typeof t>[0])}</span>
                    <span className={styles.foodCatCount}>
                      {t('productsCount', { count: cat.productCount })}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    );
  }

  // ── Shoe Market ─────────────────────────────────────────────────
  if (vConfig.vertical === 'SHOE_MARKET') {
    return (
      <section className={styles.shoeSection}>
        <div className={styles.shoeInner}>
          <div className={styles.shoeHeader}>
            <span className={styles.shoeLabel}>— {t('categoriesLabel')} —</span>
            <h2 className={styles.shoeTitle}>{t('shopByCategory')}</h2>
          </div>

          <ul className={styles.shoeGrid}>
            {SHOE_CATEGORIES.map(({ id, icon, isSale }) => (
              <li key={id}>
                <Link
                  href={id === 'sale' ? '/catalog?sale=true' : `/catalog?category=${id}`}
                  className={`${styles.shoeCard} ${isSale ? styles.shoeCardSale : ''}`}
                  onClick={() => onCategoryClick?.(id)}
                >
                  <span className={`${styles.shoeIcon} ${isSale ? styles.shoeIconSale : ''}`} aria-hidden="true">
                    {icon}
                  </span>
                  <span className={`${styles.shoeName} ${isSale ? styles.shoeNameSale : ''}`}>
                    {t(id as Parameters<typeof t>[0])}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  // ── ECOMMERCE: power-tool grid (unchanged) ───────────────────────
  return (
    <section className={styles.section} aria-label={t('title')}>
      <div className={styles.inner}>
        <h2 className={styles.srOnly}>{t('title')}</h2>
        <ul className={styles.grid}>
          {CATEGORIES.map(({ id, icon }) => (
            <li key={id}>
              <Link
                href={`/catalog?category=${id}`}
                className={styles.card}
                onClick={() => onCategoryClick?.(id)}
              >
                <span className={styles.icon} aria-hidden="true">
                  {icon}
                </span>
                <span className={styles.name}>{t(id)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
