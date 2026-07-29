'use client';

import { useQuotePrefill } from '@/stores/useQuotePrefill';

interface RouteCardProps {
  id: string;
  displayName: string;
  price: number;
  description: string | null;
  featured: boolean;
  priceLabel: string;
  vehicleCaption: string;
  featuredLabel: string;
  ctaHint: string;
  routeLabel: string;
}

export default function RouteCard({
  displayName,
  price,
  description,
  featured,
  priceLabel,
  vehicleCaption,
  featuredLabel,
  ctaHint,
  routeLabel,
}: RouteCardProps) {
  const setPrefill = useQuotePrefill((s) => s.setPrefill);

  const priceStr = Number.isInteger(price) ? `${price} €` : `${price.toFixed(2)} €`;

  // "Trenčín → Wien" → "Wien"
  const dest = displayName.split('→').pop()?.trim() ?? displayName;
  const ariaLabel = `${ctaHint}: ${displayName}, ${priceLabel} ${price} €`;
  const note = `${routeLabel}: ${displayName} — ${priceLabel} ${price} €`;

  function handleClick() {
    setPrefill('Trenčín', dest, note);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={`service-card service-card--clickable${featured ? ' service-card--featured' : ''}`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={ariaLabel}
    >
      <div>
        {featured && (
          <span className="service-card__badge">{featuredLabel}</span>
        )}
        <h3 className="service-card__name">{displayName}</h3>
        {description && (
          <p className="service-card__desc">{description}</p>
        )}
      </div>

      <div className="service-card__price">
        <span className="service-card__price-label">{priceLabel}</span>
        <strong>{priceStr}</strong>
        <span className="service-card__price-caption">{vehicleCaption}</span>
      </div>

      <span className="service-card__arrow" aria-hidden="true">↗</span>
      <span className="service-card__cta" aria-hidden="true">{ctaHint} →</span>
    </div>
  );
}
