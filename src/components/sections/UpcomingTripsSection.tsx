import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

interface TripTranslation {
  locale: string;
  name: string;
  description: string | null;
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
        <h2 id="upcoming-trips-heading" className="upcoming-trips__title">
          {t('sectionTitle')}
        </h2>
        <p className="upcoming-trips__subtitle">{t('sectionSubtitle')}</p>

        <div className="upcoming-trips__grid">
          {trips.map((trip) => {
            const tr = getTranslation(trip.translations, locale);
            const dateLabel = new Date(trip.dateStart).toLocaleDateString(
              locale === 'sk' ? 'sk-SK' : locale,
              { day: 'numeric', month: 'long', year: 'numeric' },
            );
            return (
              <Link
                key={trip.id}
                href={`/${locale}/vylety/${trip.slug}`}
                className="trip-card"
              >
                {trip.coverImage ? (
                  <div className="trip-card__image">
                    <Image
                      src={trip.coverImage}
                      alt={tr?.name ?? ''}
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div className="trip-card__image trip-card__image--placeholder" />
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
