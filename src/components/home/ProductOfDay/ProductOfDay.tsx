'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import styles from './ProductOfDay.module.css';

export interface ProductOfDayProps {
  product: {
    id: string;
    brand: string;
    name: string;
    image: string;
    price: number;
    oldPrice: number;
    currency: string;
    stockLeft: number;
    endsAt: Date;
  };
  onAddToCart: (id: string) => void;
}

// The interface carries no "initial stock", so the remaining-stock bar is sized
// against this assumed starting quantity. Adjust if a real total becomes available.
const STOCK_BAR_BASIS = 20;

const pad = (n: number) => String(n).padStart(2, '0');

function BoltIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 2 4 13.2h6L9.5 22 19 10.4h-6L13.5 2Z" />
    </svg>
  );
}

function CartPlusIcon() {
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
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3h2.2l2.2 12.2a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.2L21.5 7H6" />
    </svg>
  );
}

export default function ProductOfDay({ product, onAddToCart }: ProductOfDayProps) {
  const t = useTranslations('home');
  const tp = useTranslations('product');

  // `now` stays null until mount so server and first client render match
  // (the live countdown only begins client-side — avoids hydration mismatch).
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining =
    now == null ? 0 : Math.max(0, Math.floor((product.endsAt.getTime() - now) / 1000));

  let rest = remaining;
  const days = Math.floor(rest / 86400);
  rest -= days * 86400;
  const hours = Math.floor(rest / 3600);
  rest -= hours * 3600;
  const minutes = Math.floor(rest / 60);
  const seconds = rest - minutes * 60;

  const cells = [
    { num: pad(days), unit: t('days') },
    { num: pad(hours), unit: t('hours') },
    { num: pad(minutes), unit: t('minutes') },
    { num: pad(seconds), unit: t('seconds') },
  ];

  const formatPrice = (value: number) => new Intl.NumberFormat('uk-UA').format(value);
  const discount =
    product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null;
  const stockPct = Math.max(0, Math.min(100, (product.stockLeft / STOCK_BAR_BASIS) * 100));

  return (
    <div className={styles.col}>
      <div className={styles.pod}>
        <h2 className={styles.title}>
          <BoltIcon />
          {t('productOfDay')}
        </h2>

        <div className={styles.timer}>
          {cells.map((cell) => (
            <div className={styles.cell} key={cell.unit}>
              <div className={styles.num}>{cell.num}</div>
              <div className={styles.unit}>{cell.unit}</div>
            </div>
          ))}
        </div>

        <div className={styles.media}>
          {discount != null && <span className={styles.disc}>-{discount}%</span>}
          <Image
            className={styles.image}
            src={product.image}
            alt={product.name}
            width={300}
            height={300}
            unoptimized={product.image.endsWith('.svg')}
          />
        </div>

        <div>
          <div className={styles.brand}>{product.brand}</div>
          <h3 className={styles.name}>{product.name}</h3>
        </div>

        <div className={styles.prices}>
          <span className={styles.new}>
            {formatPrice(product.price)} {product.currency}
          </span>
          <span className={styles.old}>
            {formatPrice(product.oldPrice)} {product.currency}
          </span>
        </div>

        <div className={styles.stock}>
          <span>{t('stockLeft', { count: product.stockLeft })}</span>
          <span className={styles.bar}>
            <span className={styles.barFill} style={{ width: `${stockPct}%` }} />
          </span>
        </div>

        <button type="button" className={styles.btn} onClick={() => onAddToCart(product.id)}>
          <CartPlusIcon />
          {tp('addToCart')}
        </button>
      </div>
    </div>
  );
}
