import { getTranslations, setRequestLocale } from 'next-intl/server';
import { db } from '@/lib/db';
import { getBaseUrl } from '@/lib/url';
import { todayCutoff } from '@/lib/trip-utils';
import Image from 'next/image';
import Link from 'next/link';
import GoldDivider from '@/components/ui/GoldDivider';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

const STORE_SLUG = process.env.STORE_SLUG ?? '';

export const revalidate = 3600;

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
  const tBc = await getTranslations({ locale, namespace: 'breadcrumbs' });
  const baseUrl = getBaseUrl();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: tBc('home'), item: `${baseUrl}/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('pageTitle'), item: `${baseUrl}/${locale}/vylety` },
    ],
  };

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG }, select: { id: true } });
  const cutoff = todayCutoff();

  const [upcoming, past] = store
    ? await Promise.all([
        db.trip.findMany({
          where: { storeId: store.id, active: true, dateStart: { gte: cutoff } },
          include: {
            translations: { where: { locale: { in: [locale, 'sk'] } } },
            galleryImages: { orderBy: { sortOrder: 'asc' }, take: 1 },
          },
          orderBy: { dateStart: 'asc' },
        }),
        db.trip.findMany({
          where: { storeId: store.id, active: true, dateStart: { lt: cutoff } },
          include: {
            translations: { where: { locale: { in: [locale, 'sk'] } } },
            galleryImages: { orderBy: { sortOrder: 'asc' }, take: 1 },
          },
          orderBy: { dateStart: 'desc' },
        }),
      ])
    : [[], []];

  function getTranslation(translations: { locale: string; name: string; description: string | null }[]) {
    return translations.find((tr) => tr.locale === locale) ?? translations[0];
  }

  function TripCard({ trip }: { trip: typeof upcoming[number] }) {
    const tr = getTranslation(trip.translations);
    const cardImage = trip.coverImage ?? trip.galleryImages[0]?.url ?? null;
    const dateLabel = new Date(trip.dateStart).toLocaleDateString(locale === 'sk' ? 'sk-SK' : locale, {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    return (
      <Link href={`/${locale}/vylety/${trip.slug}`} className="trip-card">
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
  }

  return (
    <main className="trips-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="trips-page__inner">
        <Breadcrumbs items={[
          { label: tBc('home'), href: `/${locale}` },
          { label: t('pageTitle') },
        ]} />
        <Link href={`/${locale}`} className="trip-detail__back">
          ← {t('backToHome')}
        </Link>
        <div className="section-header">
          <h1 className="section-title">{t('pageTitle')}</h1>
          <GoldDivider />
          <p className="section-subtitle">{t('pageDescription')}</p>
        </div>

        {upcoming.length === 0 ? (
          <p className="trips-page__empty">{t('noTrips')}</p>
        ) : (
          <div className="trips-page__grid">
            {upcoming.map((trip) => <TripCard key={trip.id} trip={trip} />)}
          </div>
        )}

        {past.length > 0 && (
          <section className="trips-past">
            <h2 className="trips-past__title">{t('pastTitle')}</h2>
            <div className="trips-page__grid trips-past__grid">
              {past.map((trip) => <TripCard key={trip.id} trip={trip} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
