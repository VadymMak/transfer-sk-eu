import type { ServiceItem, MasterItem, StaticTestimonial, GalleryImageItem, Service, TeamMember, Testimonial } from './types';

export const SUPPORTED_LOCALES = ['de', 'en', 'sk', 'cs'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  de: 'Deutsch',
  en: 'English',
  sk: 'Slovenčina',
  cs: 'Čeština',
};

// Store identity
export const STORE_NAME = 'Transfer SK-EU';
export const WHATSAPP_NUMBER = '421951287892';
export const PHONE = '+421 951 287 892';
export const EMAIL = 'info@transfersk.eu';
export const ADDRESS = 'Trenčín, Slovakia';

// Time slot generation helpers
export const BUSINESS_START = '06:00';
export const BUSINESS_END   = '22:00';
export const SLOT_INTERVAL  = 60; // minutes

// Static services (used when DB not seeded yet or in static mode)
export const STATIC_SERVICES: ServiceItem[] = [
  { id: 's1', slug: 'vie-bratislava', nameKey: 'services.vieBratislava', name: 'Wien (VIE) → Bratislava', description: 'Direkttransfer vom Flughafen Wien nach Bratislava.', price: 59, duration: 60, image: '/services/transfer-vie-bts.webp', category: 'Transfer' },
  { id: 's2', slug: 'bratislava-vie', nameKey: 'services.bratislavaVie', name: 'Bratislava → Wien (VIE)', description: 'Direkttransfer von Bratislava zum Flughafen Wien.', price: 59, duration: 60, image: '/services/transfer-bts-vie.webp', category: 'Transfer' },
  { id: 's3', slug: 'wien-city',      nameKey: 'services.wienCity',      name: 'Wien Stadtfahrt',          description: 'Fahrten innerhalb Wiens — Bahnhof, Hotel, Messe.',  price: 39, duration: 45, image: '/services/transfer-city.webp',    category: 'City'     },
  { id: 's4', slug: 'business',       nameKey: 'services.business',       name: 'Business Transfer',        description: 'Premium-Transfer für Geschäftsreisende.',           price: 89, duration: 90, image: '/services/transfer-business.webp', category: 'Business' },
];

// Static drivers (used in static mode)
export const STATIC_MASTERS: MasterItem[] = [
  { id: 'd1', name: 'Thomas W.', role: 'Senior Driver',     bio: 'Erfahrener Fahrer mit über 10 Jahren im Personentransport. Spezialist für Airport-Transfers.', photo: '/team/driver-thomas.webp'  },
  { id: 'd2', name: 'Stefan K.', role: 'Business Driver',   bio: 'Professioneller Chauffeur für Business-Kunden. Diskretion und Pünktlichkeit garantiert.',       photo: '/team/driver-stefan.webp'  },
  { id: 'd3', name: 'Andreas M.', role: 'Night Shift Driver', bio: 'Zuverlässiger Fahrer für frühe Morgen- und späte Nachtflüge — 24/7 einsatzbereit.',           photo: '/team/driver-andreas.webp' },
];

export const STATIC_TESTIMONIALS: StaticTestimonial[] = [];

export const GALLERY_IMAGES: GalleryImageItem[] = [
  { src: '/gallery/gallery-1-car.webp',     alt: 'Premium Transfer-Fahrzeug' },
  { src: '/gallery/gallery-2-interior.webp', alt: 'Fahrzeug-Innenraum' },
  { src: '/gallery/gallery-3-airport.webp',  alt: 'Flughafen Wien' },
  { src: '/gallery/gallery-4-bratislava.webp', alt: 'Transfer nach Bratislava' },
  { src: '/gallery/gallery-5-night.webp',    alt: 'Nacht-Transfer Wien' },
];

// Display data for sections (served as fallback when DB is not seeded)
export const SERVICES: Service[] = [
  { name: 'Wien (VIE) → Bratislava', description: 'Direkttransfer, Festpreis, bis 4 Personen',            price: '€59' },
  { name: 'Bratislava → Wien (VIE)', description: 'Zuverlässige Abholung, pünktlich zum Flug',            price: '€59' },
  { name: 'Wien Stadtfahrt',          description: 'Fahrten in Wien — Bahnhof, Hotel, Kongress',           price: 'ab €39' },
  { name: 'Business Transfer',        description: 'Premium-Fahrzeug, Wasser an Bord, WLAN',               price: 'ab €89' },
  { name: 'Gruppenfahrt',             description: 'Minibus für 5–8 Personen, Gepäck inklusive',           price: 'auf Anfrage' },
  { name: 'Nacht-Transfer',           description: 'Frühflüge ab 04:00 Uhr — kein Aufpreis',              price: 'ab €59' },
  { name: 'Messe & Events',           description: 'Transfer zur Wiener Messe, Stadthalle und mehr',       price: 'auf Anfrage' },
  { name: 'VIP Transfer',             description: 'Limousine, Sektempfang, individuelle Betreuung',       price: 'ab €149' },
];

export const TEAM: TeamMember[] = [
  { name: 'Thomas W.',  role: 'Senior Driver',     experience: '10+ Jahre Erfahrung', photo: '/team/driver-thomas.webp'  },
  { name: 'Stefan K.',  role: 'Business Driver',   experience: '7 Jahre Erfahrung',   photo: '/team/driver-stefan.webp'  },
  { name: 'Andreas M.', role: 'Night Shift Driver', experience: '5 Jahre Erfahrung',   photo: '/team/driver-andreas.webp' },
];

export const TESTIMONIALS: Testimonial[] = [];

export const BARBERS: string[] = STATIC_MASTERS.map(m => m.name);
export const SERVICE_OPTIONS: string[] = [
  'Wien Flughafen (VIE) → Bratislava',
  'Bratislava (BTS) → Wien',
  'Wien Stadtfahrt',
  'Business Transfer',
];
