import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { db } from '@/lib/db';
import { getStoreConfig } from '@/lib/store-config';
import { getBaseUrl } from '@/lib/url';
import {
  ROUTE_PAGES,
  getRoutePage,
  localizedRouteName,
} from '@/lib/route-pages';
import { routeStrings, formatDuration } from '@/lib/route-pages-i18n';
import styles from './route.module.css';

export const revalidate = 60;

type RouteMeta = { nameI18n?: Record<string, string>; descI18n?: Record<string, string> };

/** Fetch all DB routes once → map by nameKey. */
async function getRouteMap(storeId: string) {
  const rows = await db.service.findMany({
    where: { storeId, active: true, category: 'route' },
    select: { nameKey: true, price: true, metadata: true },
  });
  const map = new Map<string, { price: number; meta: RouteMeta }>();
  for (const r of rows) {
    map.set(r.nameKey, { price: r.price, meta: (r.metadata as RouteMeta) ?? {} });
  }
  return map;
}

function destOf(fullName: string): string {
  return fullName.split('→').pop()?.trim() ?? fullName;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    ROUTE_PAGES.map((r) => ({ locale, slug: r.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const def = getRoutePage(slug);
  if (!def) return {};

  const config = await getStoreConfig();
  const baseUrl = getBaseUrl();
  const s = routeStrings(locale);

  const map = await getRouteMap(config.id);
  const dbRow = map.get(def.nameKey);
  const van = dbRow?.price ?? def.van;
  const name = localizedRouteName(def, dbRow?.meta.nameI18n, locale);
  const dest = destOf(name);
  const brand = config.name || 'Transfer SK-EU';

  const title = `${name} — ${s.fixedPrice} ${van} € | ${brand}`;
  const description = s.intro({ dest, dist: def.distanceKm, dur: formatDuration(def.durationMin, s), van, bus: def.bus });

  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `${baseUrl}/${l}/transfer/${slug}`]),
  );
  languages['x-default'] = `${baseUrl}/sk/transfer/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/transfer/${slug}`,
      languages,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/${locale}/transfer/${slug}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RoutePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const def = getRoutePage(slug);
  if (!def) notFound();

  setRequestLocale(locale);

  const config = await getStoreConfig();
  const baseUrl = getBaseUrl();
  const s = routeStrings(locale);

  const map = await getRouteMap(config.id);
  const dbRow = map.get(def.nameKey);
  const van = dbRow?.price ?? def.van;
  const bus = def.bus;
  const name = localizedRouteName(def, dbRow?.meta.nameI18n, locale);
  const dest = destOf(name);
  const dur = formatDuration(def.durationMin, s);

  const waHref = config.whatsappLinks.booking || config.whatsappLinks.general || '#';
  const formHref = `/${locale}#angebot`;

  const others = ROUTE_PAGES.filter((r) => r.slug !== slug);
  const faqItems = s.faq({ dest, dur, dist: def.distanceKm, van, bus });

  // ---- structured data ----
  const areaServed: Record<string, unknown>[] = [{ '@type': 'City', name: def.destCity }];
  if (def.airportIata) {
    areaServed.push({ '@type': 'Airport', name: def.airportName, iataCode: def.airportIata });
  }
  areaServed.push({ '@type': 'Country', name: def.country });

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: s.home, item: `${baseUrl}/${locale}` },
        { '@type': 'ListItem', position: 2, name, item: `${baseUrl}/${locale}/transfer/${slug}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Airport transfer',
      name,
      description: s.subtitle(dest),
      areaServed,
      provider: {
        '@type': config.vertical.schemaType,
        name: config.name,
        telephone: config.presence.phone,
        url: baseUrl,
      },
      offers: [
        { '@type': 'Offer', name: `${s.minivan} (${s.upTo5})`, price: van, priceCurrency: 'EUR' },
        { '@type': 'Offer', name: `${s.bus} (${s.upTo8})`, price: bus, priceCurrency: 'EUR' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((it) => ({
        '@type': 'Question',
        name: it.q,
        acceptedAnswer: { '@type': 'Answer', text: it.a },
      })),
    },
  ];

  return (
    <div className={styles.wrap}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href={`/${locale}`}>{s.home}</Link>
        <span className={styles.crumbSep}>›</span>
        <span>{name}</span>
      </nav>

      <header className={styles.hero}>
        <span className={styles.badge}>24/7 · {s.fixedPrice}</span>
        <h1 className={styles.title}>{name}</h1>
        <p className={styles.subtitle}>{s.subtitle(dest)}</p>
      </header>

      <div className={styles.facts}>
        <div className={styles.fact}>
          <span className={styles.factLabel}>{s.distanceLabel}</span>
          <span className={styles.factValue}>~{def.distanceKm} {s.km}</span>
        </div>
        <div className={styles.fact}>
          <span className={styles.factLabel}>{s.durationLabel}</span>
          <span className={styles.factValue}>~{dur}</span>
        </div>
        <div className={styles.fact}>
          <span className={styles.factLabel}>{s.fixedPrice}</span>
          <span className={styles.factValue}>{van} € – {bus} €</span>
        </div>
      </div>

      <table className={styles.priceTable}>
        <caption>{s.priceTitle}</caption>
        <thead>
          <tr>
            <th>{s.thVehicle}</th>
            <th>{s.thCapacity}</th>
            <th>{s.thPrice}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{s.minivan}</td>
            <td>{s.upTo5}</td>
            <td className={styles.priceCell}>{van} €</td>
          </tr>
          <tr>
            <td>{s.bus}</td>
            <td>{s.upTo8}</td>
            <td className={styles.priceCell}>{bus} €</td>
          </tr>
        </tbody>
      </table>

      <p className={styles.intro}>{s.intro({ dest, dist: def.distanceKm, dur, van, bus })}</p>

      <div className={styles.ctaRow}>
        <Link href={formHref} className={styles.ctaPrimary}>{s.cta}</Link>
        <a href={waHref} className={styles.ctaWhats} target="_blank" rel="noopener noreferrer">{s.ctaWhats}</a>
      </div>

      <h2 className={styles.sectionTitle}>{s.includedTitle}</h2>
      <ul className={styles.included}>
        {s.included.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>

      <section className={styles.faq} aria-labelledby="route-faq">
        <h2 id="route-faq" className={styles.sectionTitle}>{s.faqTitle}</h2>
        {faqItems.map((it, i) => (
          <details key={i} className={styles.faqItem}>
            <summary>{it.q}</summary>
            <p>{it.a}</p>
          </details>
        ))}
      </section>

      <h2 className={styles.sectionTitle}>{s.otherTitle}</h2>
      <div className={styles.otherGrid}>
        {others.map((r) => {
          const row = map.get(r.nameKey);
          const oName = localizedRouteName(r, row?.meta.nameI18n, locale);
          const oVan = row?.price ?? r.van;
          return (
            <Link key={r.slug} href={`/${locale}/transfer/${r.slug}`} className={styles.otherCard}>
              <span className={styles.otherName}>{oName}</span>
              <span className={styles.otherPrice}>{s.fixedPrice} {oVan} €</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
