import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import GoldDivider from '@/components/ui/GoldDivider';

interface TripTranslation {
  locale: string;
  name: string;
  description: string | null;
}

interface TripGalleryImage {
  url: string;
}

interface Trip {
  id: string;
  slug: string;
  coverImage: string | null;
  dateStart: Date;
  dateEnd: Date | null;
  price: number;
  currency: string;
  maxSeats: number | null;
  bookedSeats: number;
  translations: TripTranslation[];
  galleryImages: TripGalleryImage[];
}

interface Props {
  trips: Trip[];
  locale: string;
}

function getTranslation(
  translations: TripTranslation[],
  locale: string,
): TripTranslation | undefined {
  return translations.find((t) => t.locale === locale) ?? translations[0];
}

export default function UpcomingTripsSection({ trips, locale }: Props) {
  const t = useTranslations('trips');

  if (trips.length === 0) return null;

  return (
    <section className="upcoming-trips" aria-labelledby="upcoming-trips-heading">
      <div className="upcoming-trips__inner">
        <div className="section-header">
          <h2 id="upcoming-trips-heading" className="section-title">
            {t('sectionTitle')}
          </h2>
          <GoldDivider />
          <p className="section-subtitle">{t('sectionSubtitle')}</p>
        </div>

        <div className="upcoming-trips__grid">
          {trips.map((trip) => {
            const tr = getTranslation(trip.translations, locale);
            const dateLabel = new Date(trip.dateStart).toLocaleDateString(
              locale === 'sk' ? 'sk-SK' : locale,
              { day: 'numeric', month: 'long', year: 'numeric' },
            );
            const cardImage = trip.coverImage ?? trip.galleryImages[0]?.url ?? null;
            return (
              <Link
                key={trip.id}
                href={`/${locale}/vylety/${trip.slug}`}
                className="trip-card"
              >
                {cardImage ? (
                  <div className="trip-card__image">
                    <Image
                      src={cardImage}
                      alt={tr?.name ?? ''}
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div className="trip-card__placeholder">
                    <svg className="trip-card__placeholder-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    {tr?.name && <span className="trip-card__placeholder-name">{tr.name}</span>}
                  </div>
                )}
                <div className="trip-card__body">
                  <h3 className="trip-card__name">{tr?.name}</h3>
                  <p className="trip-card__date">{dateLabel}</p>
                  {tr?.description && (
                    <p className="trip-card__desc">{tr.description}</p>
                  )}
                  <div className="trip-card__footer">
                    <span className="trip-card__price">
                      {t('fromPrice', { price: trip.price, currency: trip.currency })}
                    </span>
                    {trip.maxSeats != null && (
                      <span className="trip-card__seats">
                        {t('seatsLeft', { n: trip.maxSeats - trip.bookedSeats })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="upcoming-trips__cta">
          <Link href={`/${locale}/vylety`} className="btn-primary">
            {t('allTripsBtn')}
          </Link>
        </div>
      </div>
    </section>
  );
}
