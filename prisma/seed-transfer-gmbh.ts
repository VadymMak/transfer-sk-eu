// Run directly: npx tsx prisma/seed-transfer-gmbh.ts

import { PrismaClient, Vertical, StoreMode } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Transfer GmbH...');

  // Navy theme for transport/business verticals
  const navyTheme = {
    colors: {
      bg:           '#060E18',
      primary:      '#C9A347',
      primaryDark:  '#A8893E',
      primaryLight: '#E0B85A',
      text:         '#FFFFFF',
      textSecondary:'#B8C4D4',
      textMuted:    '#506478',
      border:       'rgba(201, 163, 71, 0.18)',
      bgSubtle:     '#0A1828',
      success:      '#4ade80',
      error:        '#ef4444',
      contrast:     '#FFFFFF',
      overlay:      '#000000',
      overlayAlpha: 'rgba(0,0,0,0.65)',
      headerBg:     'rgba(6,14,24,0.95)',
      bgDark:       '#020D14',
      warning:      '#fbbf24',
      successLight: 'rgba(74,222,128,0.15)',
      errorLight:   'rgba(239,68,68,0.15)',
      infoLight:    'rgba(201,163,71,0.12)',
      surface:      '#0A1828',
      bgAlt:        '#0A1828',
      bgCard:       '#0E2040',
    },
    layout: {
      heroType:     'split',
      cardStyle:    'border',
      navPosition:  'top',
      borderRadius: 'sharp',
    },
  };

  // 1. Store
  const store = await db.store.upsert({
    where: { slug: 'transfer-gmbh' },
    update: { themeConfig: navyTheme, openingHours: null },
    create: {
      slug: 'transfer-gmbh',
      name: 'Transfer GmbH',
      description: 'Professionelle Flughafentransfers Wien ⇄ Bratislava. Festpreise, lizenziert, 24/7.',
      vertical: Vertical.SERVICES,
      primaryMode: StoreMode.PHYSICAL,
      regionBundle: 'EU',
      address: 'Wiedner Hauptstraße 120',
      postalCode: '1050',
      city: 'Wien',
      phone: '+43 664 000 00 00',
      whatsappPhone: '+43664000000',
      email: 'info@transfer-gmbh.at',
      founderName: 'Transfer GmbH',
      instagramUrl: 'https://instagram.com/transfergmbh',
      googleRating: 4.9,
      mapLat: 48.2081743,
      mapLng: 16.3738189,
      themeConfig: navyTheme,
    },
  });

  // 2. HeroConfig
  await db.heroConfig.upsert({
    where: { storeId: store.id },
    update: {
      titleI18n: {
        de: 'Zuverlässige Flughafentransfers Wien ⇄ Bratislava',
        en: 'Reliable Airport Transfers Vienna ⇄ Bratislava',
        sk: 'Spoľahlivé letiskové transfery Viedeň ⇄ Bratislava',
        cs: 'Spolehlivé letištní transfery Vídeň ⇄ Bratislava',
      },
      subtitleI18n: {
        de: 'Festpreise · Lizenziert & versichert · 24/7 erreichbar',
        en: 'Fixed prices · Licensed & insured · Available 24/7',
        sk: 'Pevné ceny · Licencované & poistené · Dostupné 24/7',
        cs: 'Pevné ceny · Licencované & pojištěné · Dostupné 24/7',
      },
      ctaTextI18n: {
        de: 'Angebot anfragen',
        en: 'Request a quote',
        sk: 'Vyžiadať ponuku',
        cs: 'Vyžádat nabídku',
      },
    },
    create: {
      storeId: store.id,
      title: 'Zuverlässige Flughafentransfers Wien ⇄ Bratislava',
      subtitle: 'Festpreise · Lizenziert & versichert · 24/7 erreichbar',
      ctaText: 'Angebot anfragen',
      titleI18n: {
        de: 'Zuverlässige Flughafentransfers Wien ⇄ Bratislava',
        en: 'Reliable Airport Transfers Vienna ⇄ Bratislava',
        sk: 'Spoľahlivé letiskové transfery Viedeň ⇄ Bratislava',
        cs: 'Spolehlivé letištní transfery Vídeň ⇄ Bratislava',
      },
      subtitleI18n: {
        de: 'Festpreise · Lizenziert & versichert · 24/7 erreichbar',
        en: 'Fixed prices · Licensed & insured · Available 24/7',
        sk: 'Pevné ceny · Licencované & poistené · Dostupné 24/7',
        cs: 'Pevné ceny · Licencované & pojištěné · Dostupné 24/7',
      },
      ctaTextI18n: {
        de: 'Angebot anfragen',
        en: 'Request a quote',
        sk: 'Vyžiadať ponuku',
        cs: 'Vyžádat nabídku',
      },
    },
  });

  // 3. LegalConfig
  await db.legalConfig.upsert({
    where: { storeId: store.id },
    update: {},
    create: {
      storeId: store.id,
      enabled: true,
      companyName: 'Transfer GmbH',
      street: 'Wiedner Hauptstraße 120',
      zip: '1050',
      city: 'Wien',
      country: 'Österreich',
      email: 'info@transfer-gmbh.at',
      phone: '+43 664 000 00 00',
      vatId: 'ATU00000000',
    },
  });

  // 4. Routes (category: 'route') — real price list Cenník platný od 15.7.2024
  // sortOrder: featured routes 1-4 (appear first), then non-featured 5-13 by price
  const routes = [
    // --- Featured (popular) ---
    {
      slug: 'trencin-letisko-bratislava',
      nameKey: 'Trenčín → Flughafen Bratislava',
      price: 90,
      sortOrder: 1,
      featured: true,
      nameI18n: { de: 'Trenčín → Flughafen Bratislava', sk: 'Trenčín → Letisko Bratislava', cs: 'Trenčín → Letiště Bratislava', en: 'Trenčín → Bratislava Airport' },
    },
    {
      slug: 'trencin-letisko-vieden',
      nameKey: 'Trenčín → Flughafen Wien',
      price: 145,
      sortOrder: 2,
      featured: true,
      nameI18n: { de: 'Trenčín → Flughafen Wien', sk: 'Trenčín → Letisko Viedeň', cs: 'Trenčín → Letiště Vídeň', en: 'Trenčín → Vienna Airport' },
    },
    {
      slug: 'trencin-vieden',
      nameKey: 'Trenčín → Wien',
      price: 155,
      sortOrder: 3,
      featured: true,
      nameI18n: { de: 'Trenčín → Wien', sk: 'Trenčín → Viedeň', cs: 'Trenčín → Vídeň', en: 'Trenčín → Vienna' },
    },
    {
      slug: 'trencin-prag',
      nameKey: 'Trenčín → Prag',
      price: 235,
      sortOrder: 4,
      featured: true,
      nameI18n: { de: 'Trenčín → Prag', sk: 'Trenčín → Praha', cs: 'Trenčín → Praha', en: 'Trenčín → Prague' },
    },
    // --- Non-featured, sorted by price ---
    {
      slug: 'trencin-bratislava',
      nameKey: 'Trenčín → Bratislava',
      price: 100,
      sortOrder: 5,
      featured: false,
      nameI18n: { de: 'Trenčín → Bratislava', sk: 'Trenčín → Bratislava', cs: 'Trenčín → Bratislava', en: 'Trenčín → Bratislava' },
    },
    {
      slug: 'trencin-brno',
      nameKey: 'Trenčín → Brno',
      price: 100,
      sortOrder: 6,
      featured: false,
      nameI18n: { de: 'Trenčín → Brno', sk: 'Trenčín → Brno', cs: 'Trenčín → Brno', en: 'Trenčín → Brno' },
    },
    {
      slug: 'trencin-nove-zamky',
      nameKey: 'Trenčín → Nové Zámky',
      price: 100,
      sortOrder: 7,
      featured: false,
      nameI18n: { de: 'Trenčín → Nové Zámky', sk: 'Trenčín → Nové Zámky', cs: 'Trenčín → Nové Zámky', en: 'Trenčín → Nové Zámky' },
    },
    {
      slug: 'trencin-banska-bystrica',
      nameKey: 'Trenčín → Banská Bystrica',
      price: 110,
      sortOrder: 8,
      featured: false,
      nameI18n: { de: 'Trenčín → Banská Bystrica', sk: 'Trenčín → Banská Bystrica', cs: 'Trenčín → Banská Bystrica', en: 'Trenčín → Banská Bystrica' },
    },
    {
      slug: 'trencin-oravsky-podzamok',
      nameKey: 'Trenčín → Oravský Podzámok',
      price: 120,
      sortOrder: 9,
      featured: false,
      nameI18n: { de: 'Trenčín → Oravský Podzámok', sk: 'Trenčín → Oravský Podzámok', cs: 'Trenčín → Oravský Podzámok', en: 'Trenčín → Oravský Podzámok' },
    },
    {
      slug: 'trencin-podhajska',
      nameKey: 'Trenčín → Podhájska',
      price: 120,
      sortOrder: 10,
      featured: false,
      nameI18n: { de: 'Trenčín → Podhájska', sk: 'Trenčín → Podhájska', cs: 'Trenčín → Podhájska', en: 'Trenčín → Podhájska' },
    },
    {
      slug: 'trencin-letisko-katowice',
      nameKey: 'Trenčín → Flughafen Katowice',
      price: 185,
      sortOrder: 11,
      featured: false,
      nameI18n: { de: 'Trenčín → Flughafen Katowice', sk: 'Trenčín → Letisko Katowice', cs: 'Trenčín → Letiště Katovice', en: 'Trenčín → Katowice Airport' },
    },
    {
      slug: 'trencin-kosice',
      nameKey: 'Trenčín → Košice',
      price: 225,
      sortOrder: 12,
      featured: false,
      nameI18n: { de: 'Trenčín → Košice', sk: 'Trenčín → Košice', cs: 'Trenčín → Košice', en: 'Trenčín → Košice' },
    },
    {
      slug: 'trencin-letisko-prag',
      nameKey: 'Trenčín → Flughafen Prag',
      price: 245,
      sortOrder: 13,
      featured: false,
      nameI18n: { de: 'Trenčín → Flughafen Prag', sk: 'Trenčín → Letisko Praha', cs: 'Trenčín → Letiště Praha', en: 'Trenčín → Prague Airport' },
    },
  ];

  // Remove old placeholder routes before upserting real ones
  await db.service.deleteMany({
    where: {
      storeId: store.id,
      category: 'route',
      slug: { in: [
        'vie-bratislava-zentrum', 'bratislava-bts-wien', 'wien-zentrum-bratislava',
        'bratislava-zentrum-wien-zentrum', 'vie-wien-innenstadt', 'wien-innenstadt-vie',
      ]},
    },
  });

  for (const r of routes) {
    const metadata = { nameI18n: r.nameI18n, featured: r.featured };
    await db.service.upsert({
      where: { storeId_slug: { storeId: store.id, slug: r.slug } },
      update: { price: r.price, nameKey: r.nameKey, sortOrder: r.sortOrder, metadata },
      create: {
        storeId: store.id,
        slug: r.slug,
        nameKey: r.nameKey,
        price: r.price,
        duration: 0,
        sortOrder: r.sortOrder,
        category: 'route',
        active: true,
        metadata,
      },
    });
  }

  // 5. Fleet (category: 'fleet')
  const fleet = [
    {
      slug: 'limousine',
      nameKey: 'Limousine Premium',
      description: 'Mercedes-Benz E-Klasse oder ähnlich. Klimaanlage, WLAN, Wasser.',
      metadata: { capacity: '1–3 Personen', luggage: '3 Koffer', model: 'Mercedes E-Klasse' },
    },
    {
      slug: 'van',
      nameKey: 'Van Business',
      description: 'Mercedes-Benz V-Klasse oder ähnlich. Ideal für Gruppen und viel Gepäck.',
      metadata: { capacity: '4–8 Personen', luggage: '8 Koffer', model: 'Mercedes V-Klasse' },
    },
    {
      slug: 'minibus',
      nameKey: 'Minibus',
      description: 'Sprinter oder ähnlich. Für größere Gruppen und Gruppenausflüge.',
      metadata: { capacity: '9–16 Personen', luggage: '16 Koffer', model: 'Mercedes Sprinter' },
    },
  ];

  for (const f of fleet) {
    await db.service.upsert({
      where: { storeId_slug: { storeId: store.id, slug: f.slug } },
      update: { description: f.description, metadata: f.metadata },
      create: {
        storeId: store.id,
        slug: f.slug,
        nameKey: f.nameKey,
        price: 0,
        duration: 0,
        description: f.description,
        category: 'fleet',
        metadata: f.metadata,
        active: true,
      },
    });
  }

  // 6. Leistungen (service types, no special category)
  const leistungen = [
    { slug: 'flughafentransfer', nameKey: 'Flughafentransfer', price: 45, duration: 90, description: 'Zuverlässige Transfers zu allen Flughäfen in der Region Wien–Bratislava.' },
    { slug: 'businessfahrten', nameKey: 'Businessfahrten', price: 60, duration: 60, description: 'Diskrete und pünktliche Fahrten für Geschäftsreisende. Stille garantiert.' },
    { slug: 'events-ausfluege', nameKey: 'Events & Ausflüge', price: 50, duration: 120, description: 'Gruppenausflüge, Messen, Konzerte oder Hochzeiten — wir fahren Sie hin und zurück.' },
    { slug: 'langstrecke', nameKey: 'Langstrecke', price: 0, duration: 0, description: 'Fahrten quer durch Europa auf Anfrage. Preisanfrage per WhatsApp oder Formular.' },
  ];

  for (const l of leistungen) {
    await db.service.upsert({
      where: { storeId_slug: { storeId: store.id, slug: l.slug } },
      update: { price: l.price, description: l.description },
      create: {
        storeId: store.id,
        slug: l.slug,
        nameKey: l.nameKey,
        price: l.price,
        duration: l.duration,
        description: l.description,
        active: true,
      },
    });
  }

  // 7. Testimonials (German, approved)
  const testimonials = [
    { text: 'Pünktlich, sauber, freundlicher Fahrer. Transfer vom Flughafen Wien nach Bratislava war absolut problemlos. Sehr empfehlenswert!', rating: 5, authorName: 'Markus W.', locale: 'de' },
    { text: 'Wir haben Transfer GmbH für unsere Messefahrt zur ViennaAutoShow gebucht. Van war perfekt — 6 Personen + Gepäck, kein Problem. Preis-Leistung top.', rating: 5, authorName: 'Johannes K.', locale: 'de' },
    { text: 'Flug hatte 45 Minuten Verspätung, der Fahrer hat trotzdem gewartet ohne Aufpreis. Das ist Service, den man sich wünscht. Danke!', rating: 5, authorName: 'Felix B.', locale: 'de' },
  ];

  for (const t of testimonials) {
    await db.testimonial.create({
      data: {
        storeId: store.id,
        text: t.text,
        rating: t.rating,
        authorName: t.authorName,
        locale: t.locale,
        status: 'APPROVED',
      },
    });
  }

  // 8. Admin user
  const passwordHash = await bcrypt.hash('transfer2026', 12);
  await db.adminUser.upsert({
    where: { email: 'admin@transfer-gmbh.at' },
    update: {},
    create: {
      email: 'admin@transfer-gmbh.at',
      passwordHash,
      name: 'Admin',
      storeId: store.id,
    },
  });

  console.log('Transfer GmbH seed complete!');
  console.log('   Store slug: transfer-gmbh');
  console.log('   Admin: admin@transfer-gmbh.at / transfer2026');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
