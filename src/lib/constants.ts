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
export const STORE_NAME = 'Transfer GmbH';
export const WHATSAPP_NUMBER = '43664XXXXXXX';
export const PHONE = '+43 664 000 00 00';
export const EMAIL = 'info@transfer-gmbh.at';
export const ADDRESS = 'Wiedner Hauptstraße 120, 1050 Wien, Österreich';

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

export const STATIC_TESTIMONIALS: StaticTestimonial[] = [
  { id: 't1', name: 'Klaus B.',     text: 'Pünktlich, sauber, freundlich. Der Transfer zum Flughafen hat perfekt geklappt. Sehr empfehlenswert!', rating: 5 },
  { id: 't2', name: 'Martina S.',   text: 'Buchung war einfach, Fahrer war vor Ort, alles reibungslos. Werde Transfer GmbH wieder buchen.',          rating: 5 },
  { id: 't3', name: 'Jozef P.',     text: 'Skvelý servis, vodič prišiel včas a doviezol nás bez problémov na letisko. Odporúčam!',                  rating: 5 },
  { id: 't4', name: 'Miriam H.',    text: 'Business transfer verlief absolut professionell. Limousine war tip-top, Fahrer sehr kompetent.',           rating: 5 },
];

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

export const TESTIMONIALS: Testimonial[] = [
  { stars: 5, text: '"Absolut professioneller Service. Fahrer war 10 Minuten vor der vereinbarten Zeit da, das Auto war sauber und komfortabel. Transfer GmbH ist meine erste Wahl für Flughafentransfers."', author: 'Klaus B.',   date: 'Google Bewertung · März 2026'    },
  { stars: 5, text: '"Transfer von Bratislava nach Wien geklappt wie am Schnürchen. Preis fair, Kommunikation top. Danke!"',                                                                                  author: 'Martina S.', date: 'Google Bewertung · Februar 2026' },
  { stars: 5, text: '"Business-Transfer für ein wichtiges Meeting — pünktlich, diskret, professionell. Sehr gerne wieder!"',                                                                                  author: 'Miriam H.',  date: 'Google Bewertung · Januar 2026'  },
];

export const BARBERS: string[] = STATIC_MASTERS.map(m => m.name);
export const SERVICE_OPTIONS: string[] = [
  'Wien Flughafen (VIE) → Bratislava',
  'Bratislava (BTS) → Wien',
  'Wien Stadtfahrt',
  'Business Transfer',
];
