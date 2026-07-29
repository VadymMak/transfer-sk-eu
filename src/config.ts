import { type Locale } from './i18n/routing';

/** Locales exposed to users (EU bundle: DE default, + SK/CS/EN). */
export function getActiveLocales(): Locale[] {
  return ['de', 'sk', 'cs', 'en'];
}

/** Default locale for this deployment. */
export function getDefaultLocale(): Locale {
  return 'de';
}

/** Whether a locale is active for this deployment. */
export function isLocaleActive(locale: string): locale is Locale {
  return (getActiveLocales() as string[]).includes(locale);
}
