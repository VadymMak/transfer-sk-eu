import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getBaseUrl } from '@/lib/url';
import { ROUTE_PAGES } from '@/lib/route-pages';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const staticPaths = ['', '/testimonials'];
  const routePaths = ROUTE_PAGES.map((r) => `/transfer/${r.slug}`);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const p of staticPaths) {
      entries.push({
        url: `${baseUrl}/${locale}${p}`,
        lastModified: now,
        changeFrequency: (p === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
        priority: p === '' ? 1.0 : 0.6,
      });
    }
    for (const p of routePaths) {
      entries.push({
        url: `${baseUrl}/${locale}${p}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
  }

  return entries;
}
