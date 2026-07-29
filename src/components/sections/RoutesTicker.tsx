import styles from './RoutesTicker.module.css';

interface TickerRoute {
  displayName: string;
  price: number;
}

interface RoutesTickerProps {
  routes: TickerRoute[];
  ariaLabel: string;
}

export default function RoutesTicker({ routes, ariaLabel }: RoutesTickerProps) {
  if (!routes.length) return null;

  const items = routes.map((r) => (
    <span key={r.displayName} className={styles.item}>
      <span className={styles.name}>{r.displayName}</span>
      <span className={styles.sep} aria-hidden="true">✈</span>
      <span className={styles.price}>{r.price} €</span>
    </span>
  ));

  return (
    <div className={styles.ticker} role="region" aria-label={ariaLabel}>
      <div className={styles.track}>
        {/* Primary list — read by screen readers and crawlers */}
        <div className={styles.list}>{items}</div>
        {/* Duplicate for seamless loop — hidden from assistive tech */}
        <div className={styles.list} aria-hidden="true">{items}</div>
      </div>
    </div>
  );
}
