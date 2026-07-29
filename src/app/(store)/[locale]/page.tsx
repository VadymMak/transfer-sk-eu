import { setRequestLocale } from 'next-intl/server';
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
import WhatsAppButton from '@/components/ui/WhatsAppButton';

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

  const config = await getStoreConfig();
  const { presence, whatsappLinks } = config;

  const [heroConfig, galleryImages, dbTestimonials, dbServices, dbFleet] = await Promise.all([
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
  ]);

  // Resolve locale-aware names once — used by both RoutesTicker and RoutesSection
  const mappedRoutes = dbServices.map((r) => {
    const meta = r.metadata as { nameI18n?: Record<string, string>; featured?: boolean } | null;
    return {
      id: r.id,
      displayName: meta?.nameI18n?.[locale] ?? meta?.nameI18n?.['de'] ?? r.nameKey,
      price: r.price,
      description: r.description,
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
        whatsappBookingLink={whatsappLinks.booking}
        instagram={presence.instagram}
        minRoutePrice={minRoutePrice}
      />
      <RoutesTicker
        routes={mappedRoutes}
        ariaLabel={TICKER_ARIA_LABEL[locale] ?? TICKER_ARIA_LABEL.de}
      />
      <StatsBar googleRating={presence.googleRating} />
      <TransferQuoteSection
        whatsappNumber={presence.whatsapp ?? presence.phone ?? undefined}
      />
      <DecorativeDivider />
      <RoutesSection routes={mappedRoutes} />
      <FleetSection fleet={dbFleet} />
      <ServicesSection />
      <WhyUsSection city={presence.city} googleRating={presence.googleRating} address={presence.address} />
      <AboutSection aboutImage={config.aboutImage} />
      <GallerySection images={galleryImages} layout={config.galleryLayout ?? undefined} />
      <TestimonialsSection testimonials={dbTestimonials.map((t) => ({
        id: t.id,
        name: t.authorName ?? t.customer?.name ?? 'Anonym',
        content: t.text,
        rating: t.rating,
        createdAt: t.createdAt.toISOString(),
        adminReply: t.adminReply,
        adminReplyAt: t.adminReplyAt?.toISOString() ?? null,
      }))} />
      <FaqSection locale={locale} />
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
      <WhatsAppButton href={whatsappLinks.general} />
    </>
  );
}
