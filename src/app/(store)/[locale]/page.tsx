import { setRequestLocale, getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { getStoreConfig } from '@/lib/store-config';
import HeroSection from '@/components/sections/HeroSection';
import RoutesTicker from '@/components/sections/RoutesTicker';
import DecorativeDivider from '@/components/ui/DecorativeDivider';
import StatsBar from '@/components/sections/StatsBar';
import TransferQuoteSection from '@/components/sections/TransferQuoteSection';
import RoutesSection from '@/components/sections/RoutesSection';
import FleetSection from '@/components/sections/FleetSection';
import ServicesSection from '@/components/sections/ServicesSection';
import WhyUsSection from '@/components/sections/WhyUsSection';
import AboutSection from '@/components/sections/AboutSection';
import GallerySection from '@/components/sections/GallerySection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import FaqSection from '@/components/sections/FaqSection';
import ContactSection from '@/components/sections/ContactSection';
import UpcomingTripsSection from '@/components/sections/UpcomingTripsSection';

export const revalidate = 60;

const TICKER_ARIA_LABEL: Record<string, string> = {
  de: 'Strecken und Festpreise',
  sk: 'Trasy a pevné ceny',
  cs: 'Trasy a pevné ceny',
  en: 'Routes and fixed prices',
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tRoutes = await getTranslations('routes');
  const config = await getStoreConfig();
  const { presence, whatsappLinks } = config;

  const [heroConfig, galleryImages, dbTestimonials, dbServices, dbFleet, upcomingTrips] = await Promise.all([
    db.heroConfig.findUnique({ where: { storeId: config.id } }),
    db.galleryImage.findMany({
      where: { storeId: config.id, active: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, url: true, alt: true },
    }),
    db.testimonial.findMany({
      where: { storeId: config.id, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { customer: { select: { name: true } } },
    }),
    // Routes: services with category 'route'
    db.service.findMany({
      where: { storeId: config.id, active: true, category: 'route' },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, nameKey: true, price: true, description: true, sortOrder: true, metadata: true },
    }),
    // Fleet: services with category 'fleet'
    db.service.findMany({
      where: { storeId: config.id, active: true, category: 'fleet' },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, nameKey: true, description: true, image: true, metadata: true },
    }),
    // Upcoming trips
    db.trip.findMany({
      where: { storeId: config.id, active: true, dateStart: { gte: new Date() } },
      include: {
        translations: { where: { locale: { in: [locale, 'sk'] } } },
        galleryImages: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      orderBy: { dateStart: 'asc' },
      take: 3,
    }),
  ]);

  // Resolve locale-aware names once — used by both RoutesTicker and RoutesSection
  const mappedRoutes = dbServices.map((r) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = r.metadata as { nameI18n?: Record<string, string>; descI18n?: Record<string, string>; featured?: boolean } | null;
    return {
      id: r.id,
      nameKey: r.nameKey,
      metadata: r.metadata,
      displayName: meta?.nameI18n?.[locale] ?? meta?.nameI18n?.['de'] ?? r.nameKey,
      price: r.price,
      description: meta?.descI18n?.[locale] ?? meta?.descI18n?.['en'] ?? r.description,
      featured: meta?.featured ?? false,
    };
  });

  const minRoutePrice = mappedRoutes.length
    ? Math.min(...mappedRoutes.map((r) => r.price))
    : null;

  return (
    <>
      <HeroSection
        config={heroConfig}
        locale={locale}
        city={presence.city}
        googleRating={presence.googleRating}
        openingHours={presence.openingHours}
        alwaysOpen={presence.alwaysOpen}
        whatsappBookingLink={whatsappLinks.booking}
        instagram={presence.instagram}
        minRoutePrice={minRoutePrice}
      />
      <RoutesTicker
        routes={mappedRoutes}
        ariaLabel={TICKER_ARIA_LABEL[locale] ?? TICKER_ARIA_LABEL.de}
      />
      <StatsBar />
      <TransferQuoteSection
        whatsappNumber={presence.whatsapp ?? presence.phone ?? undefined}
        minivanCaption={tRoutes('vehicleCaption')}
        routes={dbServices.map(r => {
          const meta = r.metadata as { nameI18n?: Record<string, string>; descI18n?: Record<string, string> } | null;
          return {
            nameKey: r.nameKey,
            price: r.price,
            nameI18n: meta?.nameI18n,
            desc: meta?.descI18n?.[locale] ?? meta?.descI18n?.['en'] ?? r.description ?? undefined,
          };
        })}
      />
      <DecorativeDivider />
      <RoutesSection routes={mappedRoutes} />
      <UpcomingTripsSection trips={upcomingTrips} locale={locale} />
      <FleetSection fleet={dbFleet} />
      <ServicesSection />
      <WhyUsSection city={presence.city} googleRating={presence.googleRating} address={presence.address} />
      <AboutSection aboutImage={config.aboutImage} />
      <GallerySection images={galleryImages} layout={config.galleryLayout ?? undefined} />
      <TestimonialsSection locale={locale} testimonials={dbTestimonials.map((t) => ({
        id: t.id,
        name: t.authorName ?? t.customer?.name ?? 'Anonym',
        content: t.text,
        rating: t.rating,
        createdAt: t.createdAt.toISOString(),
        adminReply: t.adminReply,
        adminReplyAt: t.adminReplyAt?.toISOString() ?? null,
      }))} />
      <FaqSection locale={locale} whatsappHref={whatsappLinks.general} />
      <ContactSection
        address={presence.address}
        city={presence.city}
        phone={presence.phone}
        email={presence.email}
        mapLat={presence.mapCoords?.lat}
        mapLng={presence.mapCoords?.lng}
        workingHours={presence.openingHours}
        alwaysOpen={presence.alwaysOpen}
        whatsappLocationLink={whatsappLinks.location}
      />
    </>
  );
}
