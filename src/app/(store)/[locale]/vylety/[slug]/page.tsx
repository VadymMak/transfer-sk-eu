import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { db } from '@/lib/db';
import { getBaseUrl } from '@/lib/url';
import Image from 'next/image';
import Link from 'next/link';

const STORE_SLUG = process.env.STORE_SLUG ?? '';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const store = await db.store.findUnique({ where: { slug: STORE_SLUG }, select: { id: true } });
  if (!store) return {};
  const trip = await db.trip.findUnique({
    where: { storeId_slug: { storeId: store.id, slug } },
    include: { translations: { where: { locale: { in: [locale, 'sk'] } } } },
  });
  if (!trip) return {};
  const tr = trip.translations.find((t) => t.locale === locale) ?? trip.translations[0];
  const baseUrl = getBaseUrl();
  return {
    title: tr?.name,
    description: tr?.description ?? undefined,
    openGraph: trip.coverImage
      ? { images: [{ url: trip.coverImage, width: 1200, height: 630 }] }
      : undefined,
    alternates: { canonical: `${baseUrl}/${locale}/vylety/${slug}` },
  };
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'trips' });

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG }, select: { id: true } });
  if (!store) notFound();

  const trip = await db.trip.findUnique({
    where: { storeId_slug: { storeId: store.id, slug } },
    include: {
      translations: { where: { locale: { in: [locale, 'sk'] } } },
      galleryImages: { orderBy: { sortOrder: 'asc' } },
    },
  });
  if (!trip || !trip.active) notFound();

  const tr = trip.translations.find((tx) => tx.locale === locale) ?? trip.translations[0];
  const baseUrl = getBaseUrl();
  const dateLabel = new Date(trip.dateStart).toLocaleDateString(locale === 'sk' ? 'sk-SK' : locale, {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const dateEndLabel = trip.dateEnd
    ? new Date(trip.dateEnd).toLocaleDateString(locale === 'sk' ? 'sk-SK' : locale, {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: tr?.name,
    description: tr?.description ?? undefined,
    startDate: trip.dateStart,
    endDate: trip.dateEnd ?? undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: `${baseUrl}/${locale}/vylety/${slug}`,
    image: trip.coverImage ?? undefined,
    offers: {
      '@type': 'Offer',
      price: trip.price,
      priceCurrency: trip.currency,
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/${locale}/vylety/${slug}`,
    },
    organizer: {
      '@type': 'Organization',
      name: 'Transfer SK EU',
      url: baseUrl,
    },
  };

  return (
    <main className="trip-detail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {trip.coverImage && (
        <div className="trip-detail__hero">
          <Image
            src={trip.coverImage}
            alt={tr?.name ?? ''}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
          <div className="trip-detail__hero-overlay" />
        </div>
      )}

      <div className="trip-detail__inner">
        <Link href={`/${locale}/vylety`} className="trip-detail__back">
          ← {t('backToList')}
        </Link>

        <h1 className="trip-detail__title">{tr?.name}</h1>

        <div className="trip-detail__meta">
          <span>{dateLabel}{dateEndLabel && ` – ${dateEndLabel}`}</span>
          <span className="trip-detail__price">
            {t('fromPrice', { price: trip.price, currency: trip.currency })}
          </span>
          {trip.maxSeats != null && (
            <span className="trip-detail__seats">
              {t('seatsLeft', { n: trip.maxSeats - trip.bookedSeats })}
            </span>
          )}
        </div>

        {tr?.description && (
          <p className="trip-detail__desc">{tr.description}</p>
        )}

        {tr?.itinerary && (
          <section className="trip-detail__itinerary">
            <h2>{t('itineraryHeading')}</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{tr.itinerary}</p>
          </section>
        )}

        {trip.galleryImages.length > 0 && (
          <section className="trip-detail__gallery">
            {trip.galleryImages.map((img) => (
              <div key={img.id} className="trip-detail__gallery-item">
                <Image
                  src={img.url}
                  alt={img.alt ?? tr?.name ?? ''}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
