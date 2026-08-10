// src/lib/route-pages.ts
// Single source of truth for the programmatic route landing pages (SEO/GEO).
// Slugs and enrichment (distance, duration, airport data) live here; the live
// prices and localized route names are pulled from the DB (category 'route') by
// nameKey at render time, with the numbers below used as a build-time fallback
// when the DB row is missing. Keep `nameKey` in sync with the seed data.

export interface RoutePageDef {
  /** URL slug: /[locale]/transfer/<slug> — stable ASCII, same across locales. */
  slug: string;
  /** Matches db.service.nameKey (English canonical) for the DB lookup. */
  nameKey: string;
  /** Minivan price (up to 5). Fallback if the DB row is missing. */
  van: number;
  /** Van/bus price (up to 8). Fallback if the DB row is missing. */
  bus: number;
  /** Approx. road distance in km (for the fact strip + copy). */
  distanceKm: number;
  /** Approx. driving time in minutes. */
  durationMin: number;
  /** Canonical English destination city (schema areaServed). */
  destCity: string;
  /** Destination country (schema areaServed Country). */
  country: string;
  /** IATA code if the destination is an airport. */
  airportIata?: string;
  /** Full airport name (schema Airport). */
  airportName?: string;
}

export const ROUTE_PAGES: RoutePageDef[] = [
  {
    slug: 'trencin-bratislava',
    nameKey: 'Trenčín → Bratislava',
    van: 90,
    bus: 120,
    distanceKm: 130,
    durationMin: 90,
    destCity: 'Bratislava',
    country: 'Slovakia',
  },
  {
    slug: 'trencin-vienna-airport',
    nameKey: 'Trenčín → Vienna Airport',
    van: 140,
    bus: 190,
    distanceKm: 180,
    durationMin: 120,
    destCity: 'Vienna',
    country: 'Austria',
    airportIata: 'VIE',
    airportName: 'Vienna International Airport',
  },
  {
    slug: 'trencin-budapest-airport',
    nameKey: 'Trenčín → Budapest Airport',
    van: 250,
    bus: 290,
    distanceKm: 330,
    durationMin: 210,
    destCity: 'Budapest',
    country: 'Hungary',
    airportIata: 'BUD',
    airportName: 'Budapest Ferenc Liszt International Airport',
  },
  {
    slug: 'trencin-prague-airport',
    nameKey: 'Trenčín → Prague Airport',
    van: 270,
    bus: 330,
    distanceKm: 360,
    durationMin: 240,
    destCity: 'Prague',
    country: 'Czechia',
    airportIata: 'PRG',
    airportName: 'Václav Havel Airport Prague',
  },
];

export function getRoutePage(slug: string): RoutePageDef | undefined {
  return ROUTE_PAGES.find((r) => r.slug === slug);
}

/** Localized destination name from the DB nameI18n, falling back to nameKey. */
export function localizedRouteName(
  def: RoutePageDef,
  nameI18n: Record<string, string> | undefined,
  locale: string,
): string {
  return nameI18n?.[locale] ?? nameI18n?.['en'] ?? def.nameKey;
}
