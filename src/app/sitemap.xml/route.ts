// ⚠️ WHY A ROUTE HANDLER AND NOT app/sitemap.ts
// Next.js (14–16) silently drops hreflang alternates from the
// MetadataRoute.Sitemap generator. Hand-written XML is the only
// reliable way to emit them. After any change here, confirm that
// /sitemap.xml actually contains <xhtml:link rel="alternate">.
//
// ⚠️ localePrefix is 'always' in this project — every locale is
// prefixed, including the default one. Do not add the
// "default locale has no prefix" branch.

import { getActiveLocales, getDefaultLocale } from '@/config';
import { ROUTE_PAGES } from '@/lib/route-pages';
import { getBaseUrl } from '@/lib/url';

const LOCALES = getActiveLocales();
const DEFAULT_LOCALE = getDefaultLocale();

function xmlEscape(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface Entry {
  path: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: number;
}

function urlBlocks(entry: Entry, lastmod: string, baseUrl: string): string {
  const loc = (locale: string) => `${baseUrl}/${locale}${entry.path}`;

  const alternates = LOCALES.map(
    (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${xmlEscape(loc(l))}" />`,
  ).join('\n');

  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(loc(DEFAULT_LOCALE))}" />`;

  return LOCALES.map(
    (locale) => `  <url>
    <loc>${xmlEscape(loc(locale))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
${alternates}
${xDefault}
  </url>`,
  ).join('\n');
}

export async function GET(): Promise<Response> {
  const baseUrl = getBaseUrl();
  const lastmod = new Date().toISOString();
  const entries: Entry[] = [];

  // Static pages
  for (const path of ['', '/testimonials']) {
    entries.push({
      path,
      changefreq: path === '' ? 'weekly' : 'monthly',
      priority: path === '' ? 1.0 : 0.6,
    });
  }

  // Programmatic route landing pages
  for (const r of ROUTE_PAGES) {
    entries.push({ path: `/transfer/${r.slug}`, changefreq: 'monthly', priority: 0.9 });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map((e) => urlBlocks(e, lastmod, baseUrl)).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
