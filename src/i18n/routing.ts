import { defineRouting } from 'next-intl/routing';

/**
 * EU-only routing for Transfer GmbH.
 * Only de/sk/cs/en are served — requests for other locales are redirected to /de by middleware.
 */
export const routing = defineRouting({
  locales: ['de', 'sk', 'cs', 'en'],
  defaultLocale: 'de',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
