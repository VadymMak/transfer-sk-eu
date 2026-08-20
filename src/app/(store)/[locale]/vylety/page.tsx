import { getTranslations, setRequestLocale } from 'next-intl/server';
import { db } from '@/lib/db';
import { getBaseUrl } from '@/lib/url';
import Image from 'next/image';
import Link from 'next/link';

const STORE_SLUG = process.env.STORE_SLUG ?? '';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'trips' });
  const baseUrl = getBaseUrl();
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    alternates: { canonical: `${baseUrl}/${locale}/vylety` },
  };
}

export default async function VyletyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'trips' });

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG }, select: { id: true } });
  const now = new Date();
  const trips = store
    ? await db.trip.findMany({
        where: { storeId: store.id, active: true, dateStart: { gte: now } },
        include: { translations: { where: { locale: { in: [locale, 'sk'] } } } },
        orderBy: { dateStart: 'asc' },
      })
    : [];

  function getTranslation(translations: { locale: string; name: string; description: string | null }[]) {
    return translations.find((t) => t.locale === locale) ?? translations[0];
  }

  return (
    <main className="trips-page">
      <div className="trips-page__inner">
        <h1 className="trips-page__title">{t('pageTitle')}</h1>
        <p className="trips-page__subtitle">{t('pageDescription')}</p>

        {trips.length === 0 ? (
          <p className="trips-page__empty">{t('noTrips')}</p>
        ) : (
          <div className="trips-page__grid">
            {trips.map((trip) => {
              const tr = getTranslation(trip.translations);
              const dateLabel = new Date(trip.dateStart).toLocaleDateString(locale === 'sk' ? 'sk-SK' : locale, {
                day: 'numeric', month: 'long', year: 'numeric',
              });
              return (
                <Link key={trip.id} href={`/${locale}/vylety/${trip.slug}`} className="trip-card">
                  {trip.coverImage && (
                    <div className="trip-card__image">
                      <Image
                        src={trip.coverImage}
                        alt={tr?.name ?? ''}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="trip-card__body">
                    <h2 className="trip-card__name">{tr?.name}</h2>
                    <p className="trip-card__date">{dateLabel}</p>
                    {tr?.description && (
                      <p className="trip-card__desc">{tr.description}</p>
                    )}
                    <div className="trip-card__footer">
                      <span className="trip-card__price">{t('fromPrice', { price: trip.price, currency: trip.currency })}</span>
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
        )}
      </div>
    </main>
  );
}
