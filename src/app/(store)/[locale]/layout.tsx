import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import { routing, type Locale } from '@/i18n/routing';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import CookieBanner from '@/components/ui/CookieBanner/CookieBanner';
import { getStoreConfig } from '@/lib/store-config';
import { getActiveLocales } from '@/config';
import { themeToCssVars, DEFAULT_THEME } from '@/lib/theme';
import { db } from '@/lib/db';
import { VerticalProvider } from '@/lib/vertical-context';
import { PresenceProvider } from '@/lib/presence-context';
import { CustomerProvider } from '@/lib/useCustomer';
import { getBaseUrl } from '@/lib/url';
import '../../globals.css';

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-dm-sans',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const config = await getStoreConfig();
  const baseUrl = getBaseUrl();

  const titles: Record<string, string> = {
    de: 'Flughafentransfer Wien ⇄ Bratislava | Transfer GmbH',
    sk: 'Letiskový transfer Viedeň ⇄ Bratislava | Transfer GmbH',
    cs: 'Letištní transfer Vídeň ⇄ Bratislava | Transfer GmbH',
    en: 'Airport Transfer Vienna ⇄ Bratislava | Transfer GmbH',
  };
  const descriptions: Record<string, string> = {
    de: 'Professionelle Flughafentransfers Wien (VIE) ⇄ Bratislava (BTS). Festpreise, lizenziert, 24/7. Einfach online anfragen.',
    sk: 'Profesionálne letiskové transfery Viedeň (VIE) ⇄ Bratislava (BTS). Pevné ceny, licencovaní, 24/7. Objednajte online.',
    cs: 'Profesionální letištní transfery Vídeň (VIE) ⇄ Bratislava (BTS). Pevné ceny, licencováni, 24/7. Objednejte online.',
    en: 'Professional airport transfers Vienna (VIE) ⇄ Bratislava (BTS). Fixed prices, licensed, 24/7. Book online.',
  };

  const title = titles[locale] ?? titles.de;
  const description = descriptions[locale] ?? descriptions.de;
  const ogLocale = locale === 'de' ? 'de_DE' : locale === 'sk' ? 'sk_SK' : locale === 'cs' ? 'cs_CZ' : 'en_US';
  const ogImage = config.ogImageUrl ?? `${baseUrl}/og-image.jpg`;

  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `${baseUrl}/${l}`])
  );
  languages['x-default'] = `${baseUrl}/de`;

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages,
    },
    openGraph: {
      title,
      description,
      locale: ogLocale,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Transfer GmbH' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

// Re-check DB every 60 seconds (ISR)
export const revalidate = 60;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const config = await getStoreConfig();
  const cssVars = themeToCssVars(config.theme ?? DEFAULT_THEME);
  const baseUrl = getBaseUrl();
  const tSeo = await getTranslations('seo');
  const seoDescription = tSeo('description', { city: config.presence.city ?? '' });

  const storeSlug = process.env.STORE_SLUG ?? '';
  const store = locale === 'de'
    ? await db.store.findUnique({ where: { slug: storeSlug } })
    : null;
  const legalConfig = store
    ? await db.legalConfig.findUnique({ where: { storeId: store.id } })
    : null;
  const legalEnabled = legalConfig?.enabled ?? false;

  const localeCountryMap: Record<string, string> = {
    sk: 'SK', cs: 'CZ', de: 'DE', uk: 'UA', en: 'GB', pl: 'PL', ru: 'RU',
  };
  const addressCountry = localeCountryMap[locale] ?? 'SK';
  const sameAs = [config.presence.instagram, config.presence.facebook].filter(Boolean) as string[];
  const ogImage = config.ogImageUrl ?? `${baseUrl}/og-image.jpg`;
  const jsonLdRaw: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': config.vertical.schemaType,
    '@id': `${baseUrl}/#business`,
    name: config.name,
    description: seoDescription,
    url: `${baseUrl}/${locale}`,
    image: ogImage,
    telephone: config.presence.phone,
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Cash, Credit Card',
    areaServed: [
      { '@type': 'City', name: 'Wien' },
      { '@type': 'City', name: 'Bratislava' },
      { '@type': 'Airport', name: 'Vienna International Airport', iataCode: 'VIE' },
      { '@type': 'Airport', name: 'Bratislava Airport', iataCode: 'BTS' },
      { '@type': 'Country', name: 'Austria' },
      { '@type': 'Country', name: 'Slovakia' },
    ],
    ...(config.presence.address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: config.presence.address,
            addressLocality: config.presence.city,
            postalCode: config.presence.postalCode,
            addressCountry,
          },
        }
      : {}),
    ...(config.presence.mapCoords
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: config.presence.mapCoords.lat,
            longitude: config.presence.mapCoords.lng,
          },
        }
      : {}),
    ...(config.presence.googleRating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: config.presence.googleRating,
            bestRating: 5,
            ratingCount: 100,
          },
        }
      : {}),
    ...(config.presence.alwaysOpen
      ? {
          openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '00:00',
            closes: '23:59',
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <html lang={locale} data-vertical={config.vertical.vertical} className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://conuflmgcnkfqjmncsth.public.blob.vercel-storage.com" />
        <link rel="dns-prefetch" href="https://conuflmgcnkfqjmncsth.public.blob.vercel-storage.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdRaw) }}
        />
      </head>
      <body style={cssVars as React.CSSProperties}>
        <NextIntlClientProvider messages={messages}>
          <CustomerProvider>
            <VerticalProvider config={config.vertical}>
              <PresenceProvider presence={config.presence}>
                <Header logoUrl={config.logoUrl} whatsappBookingLink={config.whatsappLinks.booking} activeLocales={getActiveLocales()} />
                <main>{children}</main>
                <Footer config={config} locale={locale} />
                <CookieBanner />
              </PresenceProvider>
            </VerticalProvider>
          </CustomerProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
