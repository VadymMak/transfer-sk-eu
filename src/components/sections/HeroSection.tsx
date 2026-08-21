import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { formatHoursDisplay } from '@/lib/formatHours';
import type { WorkingHours } from '@/lib/store-config';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

interface HeroConfig {
  title?: string | null;
  subtitle?: string | null;
  ctaText?: string | null;
  titleI18n?: unknown;
  subtitleI18n?: unknown;
  ctaTextI18n?: unknown;
  imageUrl?: string | null;
}

export interface HeroTripCard {
  slug: string;
  name: string;
  dateStart: Date;
  price: number;
  image: string | null;
}

interface HeroSectionProps {
  config?: HeroConfig | null;
  locale?: string;
  city?: string;
  googleRating?: number;
  openingHours?: WorkingHours;
  alwaysOpen?: boolean;
  whatsappBookingLink?: string;
  instagram?: string;
  minRoutePrice?: number | null;
  heroTrips?: HeroTripCard[];
}

function formatTripDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'sk' ? 'sk-SK' : locale, {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
}

export default async function HeroSection({
  config,
  locale = 'de',
  city,
  googleRating,
  openingHours,
  alwaysOpen,
  whatsappBookingLink,
  instagram,
  minRoutePrice,
  heroTrips = [],
}: HeroSectionProps) {
  const tHero = await getTranslations('hero');

  const DEFAULT_LOCALE = 'de';
  const pick = (raw: unknown, legacy: string | null | undefined, key: string) => {
    const map = raw as Record<string, string> | null | undefined;
    return map?.[locale] || map?.[DEFAULT_LOCALE] || legacy || tHero(key as Parameters<typeof tHero>[0]);
  };

  const title    = pick(config?.titleI18n,    config?.title,    'defaultTitle');
  const subtitle = pick(config?.subtitleI18n, config?.subtitle, 'defaultSubtitle');
  const ctaText  = pick(config?.ctaTextI18n,  config?.ctaText,  'defaultCta');
  const hoursText   = alwaysOpen ? '24/7' : formatHoursDisplay(openingHours);
  const ratingLabel = googleRating ? `⭐ Google ${googleRating}` : null;

  return (
    <section className="hero">
      <div className="hero__inner">
        <div className="hero__content">
          <p className="hero__tagline">
            <span className="hero__tagline-line" />
            {tHero('eyebrow')}
          </p>

          <h1 className="hero__title">{title}</h1>

          <p className="hero__subtitle">{subtitle}</p>

          <div className="hero__chips">
            <a className="hero__chip" href="#leistungen" data-tip={tHero('chip1Tip')}>{tHero('chip1')}</a>
            <a className="hero__chip" href="#leistungen" data-tip={tHero('chip2Tip')}>{tHero('chip2')}</a>
            <a className="hero__chip" href="#leistungen" data-tip={tHero('chip3Tip')}>{tHero('chip3')}</a>
            <a className="hero__chip" href="#fuhrpark"   data-tip={tHero('chip4Tip')}>{tHero('chip4')}</a>
          </div>

          {minRoutePrice != null && (
            <p className="hero__price-anchor">{tHero('priceAnchor', { price: minRoutePrice })}</p>
          )}

          <div className="hero__buttons">
            <a href="#rezervacia" className="btn-primary">
              {ctaText}
            </a>
            {whatsappBookingLink && whatsappBookingLink !== '#' && (
              <a
                href={whatsappBookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                <WhatsAppIcon size={18} />
                WhatsApp
              </a>
            )}
          </div>

          <p className="hero__trust">
            {ratingLabel && <span className="hero__trust-item">{ratingLabel}</span>}
            {hoursText && (
              <><span>&nbsp;·&nbsp;</span><span className="hero__trust-item">🕐 {hoursText}</span></>
            )}
            {city && (
              <><span>&nbsp;·&nbsp;</span><span className="hero__trust-item">📍 {city}</span></>
            )}
            {instagram && (
              <><span>&nbsp;·&nbsp;</span>
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="hero__instagram" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>
              </>
            )}
          </p>
        </div>

        <div className="hero__image-wrap">
          {config?.imageUrl ? (
            <Image
              className="hero__video"
              src={config.imageUrl}
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
              quality={75}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <video className="hero__video" autoPlay muted loop playsInline preload="metadata"
                   poster="/media/hero-poster.jpg" aria-hidden="true">
              <source src="/media/hero.webm" type="video/webm" />
              <source src="/media/hero.mp4"  type="video/mp4" />
            </video>
          )}
          <div className="hero__overlay" />

          {heroTrips.length > 0 && (
            <div className="hero-trips">
              <p className="hero-trips__head">{tHero('closestTripsTitle')}</p>
              {heroTrips.map((t) => (
                <Link
                  key={t.slug}
                  href={`/${locale}/vylety/${t.slug}`}
                  className="hero-trip-card"
                  aria-label={`${t.name} — ${tHero('closestTripsTitle')}`}
                >
                  <span
                    className="hero-trip-card__img"
                    style={t.image ? { backgroundImage: `url(${t.image})` } : undefined}
                  >
                    {!t.image && <span className="hero-trip-card__ph">🚌</span>}
                  </span>
                  <span className="hero-trip-card__body">
                    <span className="hero-trip-card__date">{formatTripDate(t.dateStart, locale)}</span>
                    <span className="hero-trip-card__name">{t.name}</span>
                    <span className="hero-trip-card__row">
                      <span className="hero-trip-card__price">{tHero('fromPrice', { price: t.price })}</span>
                      <span className="hero-trip-card__go">{tHero('more')} →</span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
