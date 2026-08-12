import { defineRouting } from 'next-intl/routing';

/**
 * Routing for Transfer SK-EU.
 * Serves de, sk, cs, en, ru, uk — defaultLocale: sk.
 */
export const routing = defineRouting({
  locales: ['de', 'sk', 'cs', 'en', 'ru', 'uk'],
  defaultLocale: 'sk',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
