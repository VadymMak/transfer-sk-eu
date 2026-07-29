'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import ProductCard, { type ProductCardProps } from '@/components/catalog/ProductCard/ProductCard';
import styles from './NewArrivals.module.css';

interface NewArrivalsProps {
  products: ProductCardProps[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  const t = useTranslations('home');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 280 + 16;
    el.scrollBy({ left: dir === 'left' ? -cardWidth * 2 : cardWidth * 2, behavior: 'smooth' });
  };

  return (
    <section className={styles.section}>
      <div className={styles.wrap}>
        {/* Title row */}
        <div className={styles.titleRow}>
          <h2 className={styles.title}>
            <svg className={styles.sparkle} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v1m0 16v1m-7.07-2.93l.71-.71m12.72-12.72l.71-.71M3 12h1m16 0h1m-2.93 7.07l-.71-.71M5.64 5.64l-.71-.71" />
              <path d="m12 8-1.5 3.5L7 13l3.5 1.5L12 18l1.5-3.5L17 13l-3.5-1.5Z" />
            </svg>
            {t('newArrivalsTitle')}
          </h2>
          <Link href="/catalog?new=true" className={styles.viewAll}>
            {t('viewAll')} →
          </Link>
        </div>

        {/* Carousel */}
        <div className={styles.carouselWrap}>
          {/* Left arrow */}
          {canScrollLeft && (
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowLeft}`}
              onClick={() => scroll('left')}
              aria-label="Scroll left"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Scrollable track */}
          <div ref={scrollRef} className={styles.track}>
            {products.map((p) => (
              <div key={p.id} className={styles.slide}>
                <ProductCard {...p} />
              </div>
            ))}
          </div>

          {/* Right arrow */}
          {canScrollRight && (
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowRight}`}
              onClick={() => scroll('right')}
              aria-label="Scroll right"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
