import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { db } from '@/lib/db';
import { getBaseUrl } from '@/lib/url';
import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

const STORE_SLUG = process.env.STORE_SLUG ?? '';

export const revalidate = 60;

type FaqItem = { q: string; a: string };

function parseFaq(raw: unknown): FaqItem[] {
  if (!Array.isArray(raw)) return [];
  return (raw as unknown[]).filter(
    (item): item is FaqItem =>
      typeof item === 'object' && item !== null &&
      'q' in item && typeof (item as FaqItem).q === 'string' &&
      'a' in item && typeof (item as FaqItem).a === 'string',
  );
}

function splitLines(text: string | null | undefined): string[] {
  if (!text) return [];
  return text.split('\n').map((s) => s.replace(/^[-•*\d.]+\s*/, '').trim()).filter(Boolean);
}

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
  const tp = await getTranslations({ locale, namespace: 'tripPage' });
  const tBc = await getTranslations({ locale, namespace: 'breadcrumbs' });

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG }, select: { id: true } });
  if (!store) notFound();

  const trip = await db.trip.findUnique({
    where: { storeId_slug: { storeId: store.id, slug } },
    include: {
      translations: { where: { locale: { in: [locale, 'sk'] } } },
      galleryImages: { orderBy: { sortOrder: 'asc' } },
      videos: { orderBy: { sortOrder: 'asc' } },
    },
  });
  if (!trip || !trip.active) notFound();

  const tr = trip.translations.find((tx) => tx.locale === locale) ?? trip.translations[0];
  const baseUrl = getBaseUrl();

  const localeTag = locale === 'sk' ? 'sk-SK' : locale;
  const dateLabel = new Date(trip.dateStart).toLocaleDateString(localeTag, {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const dateEndLabel = trip.dateEnd
    ? new Date(trip.dateEnd).toLocaleDateString(localeTag, {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;
  const updatedLabel = new Date(trip.updatedAt).toLocaleDateString(localeTag, {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const faqItems = parseFaq(tr?.faq);
  const tagList = tr?.tags ? tr.tags.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const audienceLines = splitLines(tr?.audience);
  const includedLines = splitLines(tr?.included);
  const itineraryLines = splitLines(tr?.itinerary);

  const waPhone = trip.bookingPhone?.replace(/\D/g, '') ?? null;

  // ── JSON-LD ──
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: tBc('home'), item: `${baseUrl}/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('pageTitle'), item: `${baseUrl}/${locale}/vylety` },
      { '@type': 'ListItem', position: 3, name: tr?.name, item: `${baseUrl}/${locale}/vylety/${slug}` },
    ],
  };

  const eventJsonLd = {
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

  const faqJsonLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  } : null;

  return (
    <main className={`trip-detail${trip.coverImage ? ' trip-detail--has-hero' : ''}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      {/* ── Cover ── */}
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
          <div className="trip-detail__hero-badge">
            <span className="trip-detail__hero-badge-label">{tp('nextDeparture')}</span>
            <span className="trip-detail__hero-badge-date">{dateLabel}</span>
          </div>
        </div>
      )}

      <div className="trip-detail__inner">
        <Breadcrumbs items={[
          { label: tBc('home'), href: `/${locale}` },
          { label: t('pageTitle'), href: `/${locale}/vylety` },
          { label: tr?.name ?? slug },
        ]} />

        <Link href={`/${locale}/vylety`} className="trip-detail__back">
          ← {t('backToList')}
        </Link>

        {/* ── Meta line ── */}
        <p className="trip-detail__meta-line">
          {tp('updated')}: {updatedLabel}
          {trip.readMinutes && <> · {trip.readMinutes} {tp('minRead')}</>}
          {' · '}{tp('oneDay')}
        </p>

        {/* ── H1 ── */}
        <h1 className="trip-detail__title">{tr?.name}</h1>
        {tr?.headline && <p className="trip-detail__headline">{tr.headline}</p>}

        {/* ── Tags ── */}
        {tagList.length > 0 && (
          <div className="trip-detail__tags">
            {tagList.map((tag, i) => (
              <span key={i} className="trip-detail__tag">{tag}</span>
            ))}
          </div>
        )}

        {/* ── Lead description ── */}
        {tr?.description && (
          <p className="trip-detail__desc">{tr.description}</p>
        )}

        {/* ── Facts strip ── */}
        <div className="trip-facts">
          <div className="trip-facts__item">
            <span className="trip-facts__label">{tp('factsDate')}</span>
            <span className="trip-facts__value">{dateLabel}{dateEndLabel && ` – ${dateEndLabel}`}</span>
          </div>
          <div className="trip-facts__item">
            <span className="trip-facts__label">{tp('factsPrice')}</span>
            <span className="trip-facts__value trip-facts__value--primary">{trip.price} {trip.currency}</span>
            {trip.priceChild != null && (
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                {trip.priceChild} {trip.currency} (deti)
              </span>
            )}
          </div>
          {(trip.seatsTotal ?? trip.maxSeats) != null && (
            <div className="trip-facts__item">
              <span className="trip-facts__label">{t('seatsLeft', { n: (trip.seatsTotal ?? trip.maxSeats ?? 0) - trip.bookedSeats })}</span>
            </div>
          )}
        </div>

        {/* ── Booking strip ── */}
        {trip.bookingPhone && (
          <div className="trip-booking">
            <div className="trip-booking__cta">
              {waPhone && (
                <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer" className="trip-booking__btn trip-booking__btn--wa">
                  {tp('whatsapp')}
                </a>
              )}
              <a href={`tel:${trip.bookingPhone}`} className="trip-booking__btn trip-booking__btn--call">
                {tp('bookNow')}
              </a>
            </div>
            {trip.prepayment != null && (
              <p className="trip-booking__note">{trip.prepayment} {trip.currency} {tp('prepaymentNote')}</p>
            )}
            {tr?.bookingNote && <p className="trip-booking__note">{tr.bookingNote}</p>}
          </div>
        )}

        {/* ── Audience ── */}
        {audienceLines.length > 0 && (
          <section className="trip-section">
            <h2 className="trip-section__title">{tp('audienceTitle')}</h2>
            <ul className="trip-list">
              {audienceLines.map((line, i) => <li key={i}>{line}</li>)}
            </ul>
          </section>
        )}

        {/* ── Programme / Timeline ── */}
        {itineraryLines.length > 0 && (
          <section className="trip-section">
            <h2 className="trip-section__title">{tp('programmeTitle')}</h2>
            <ol className="trip-timeline">
              {itineraryLines.map((step, i) => (
                <li key={i} className="trip-timeline__item">{step}</li>
              ))}
            </ol>
          </section>
        )}

        {/* ── Videos ── */}
        {trip.videos.length > 0 && (
          <section className="trip-section">
            <h2 className="trip-section__title">{tp('videosTitle')}</h2>
            <div className="trip-reels">
              {trip.videos.map((video) => (
                <div key={video.id} className="trip-reel">
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video src={video.url} poster={video.poster ?? undefined} controls muted playsInline />
                  {video.caption && <p className="trip-reel__caption">{video.caption}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Gallery ── */}
        {trip.galleryImages.length > 0 && (
          <section className="trip-section">
            <h2 className="trip-section__title">{tp('galleryTitle')}</h2>
            <div className="trip-detail__gallery">
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
            </div>
          </section>
        )}

        {/* ── Price / Included / Extras ── */}
        {(includedLines.length > 0 || tr?.extrasNote) && (
          <section className="trip-section">
            <h2 className="trip-section__title">{tp('priceTitle')}</h2>
            <div className="trip-price-grid">
              {includedLines.length > 0 && (
                <div className="trip-price-grid__col">
                  <h3>{tp('included')}</h3>
                  <ul className="trip-list">
                    {includedLines.map((line, i) => <li key={i}>{line}</li>)}
                  </ul>
                </div>
              )}
              {tr?.extrasNote && (
                <div className="trip-price-grid__col">
                  <h3>{tp('extra')}</h3>
                  <p style={{ whiteSpace: 'pre-line', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{tr.extrasNote}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        {faqItems.length > 0 && (
          <section className="trip-section">
            <h2 className="trip-section__title">{tp('faqTitle')}</h2>
            <div className="trip-faq">
              {faqItems.map((item, i) => (
                <details key={i} className="trip-faq__item">
                  <summary className="trip-faq__q">{item.q}</summary>
                  <p className="trip-faq__a">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ── Bottom CTA ── */}
        {trip.bookingPhone && (
          <div className="trip-cta">
            <p className="trip-cta__text">{tp('bookTitle')}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {waPhone && (
                <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer" className="trip-booking__btn trip-booking__btn--wa">
                  {tp('whatsapp')}
                </a>
              )}
              <a href={`tel:${trip.bookingPhone}`} className="trip-booking__btn trip-booking__btn--call">
                {tp('bookNow')}
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
