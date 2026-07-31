// Run directly: npx tsx prisma/seed-transfer-gmbh.ts

import { PrismaClient, Vertical, StoreMode } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { AZURE_LIGHT } from '../src/lib/theme';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') }); // fallback

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Transfer SK-EU...');


  // 1. Store
  const store = await db.store.upsert({
    where: { slug: 'transfer-sk-eu' },
    update: {
      name: 'Transfer SK-EU',
      description: 'Letiskové transfery a súkromné cesty z Trenčína. Bratislava, Viedeň, Budapešť. Pevné ceny, 24/7, až 8 osôb.',
      address: 'Trenčín',
      postalCode: '911 01',
      city: 'Trenčín',
      phone: '+421 900 000 000',
      whatsappPhone: '421900000000',
      email: 'info@transfersk.eu',
      founderName: 'Transfer SK-EU',
      instagramUrl: null,
      googleRating: null,
      mapLat: 48.8945,
      mapLng: 18.0447,
      themeConfig: AZURE_LIGHT,
      openingHours: null,
    },
    create: {
      slug: 'transfer-sk-eu',
      name: 'Transfer SK-EU',
      description: 'Letiskové transfery a súkromné cesty z Trenčína. Bratislava, Viedeň, Budapešť. Pevné ceny, 24/7, až 8 osôb.',
      vertical: Vertical.SERVICES,
      primaryMode: StoreMode.PHYSICAL,
      regionBundle: 'EU',
      address: 'Trenčín',
      postalCode: '911 01',
      city: 'Trenčín',
      phone: '+421 900 000 000',
      whatsappPhone: '421900000000',
      email: 'info@transfersk.eu',
      founderName: 'Transfer SK-EU',
      mapLat: 48.8945,
      mapLng: 18.0447,
      themeConfig: AZURE_LIGHT,
    },
  });

  // 2. HeroConfig
  await db.heroConfig.upsert({
    where: { storeId: store.id },
    update: {
      titleI18n: {
        sk: 'Letiskové transfery a súkromné cesty z Trenčína',
        en: 'Airport Transfers & Private Trips from Trenčín',
        de: 'Flughafentransfers & Privatfahrten ab Trenčín',
        ru: 'Трансферы в аэропорт и поездки из Тренчина',
        uk: 'Трансфери в аеропорт і поїздки з Тренчина',
      },
      subtitleI18n: {
        sk: 'Letiská Bratislava · Viedeň · Budapešť · cesty po Európe · dovoz vecí. Pevné ceny, 24/7, až 8 osôb.',
        en: 'Bratislava · Vienna · Budapest airports · trips across Europe · deliveries. Fixed prices, 24/7, up to 8 passengers.',
        de: 'Flughäfen Bratislava · Wien · Budapest · Reisen durch Europa · Lieferungen. Festpreise, 24/7, bis 8 Personen.',
        ru: 'Аэропорты Братислава · Вена · Будапешт · поездки по Европе · довоз вещей. Фиксированные цены, 24/7, до 8 пассажиров.',
        uk: 'Аеропорти Братислава · Відень · Будапешт · поїздки Європою · довіз речей. Фіксовані ціни, 24/7, до 8 пасажирів.',
      },
      ctaTextI18n: {
        sk: 'Vyžiadať ponuku',
        en: 'Request a quote',
        de: 'Angebot anfragen',
        ru: 'Запросить расчёт',
        uk: 'Запросити розрахунок',
      },
    },
    create: {
      storeId: store.id,
      title: 'Letiskové transfery a súkromné cesty z Trenčína',
      subtitle: 'Letiská Bratislava · Viedeň · Budapešť · cesty po Európe · dovoz vecí. Pevné ceny, 24/7, až 8 osôb.',
      ctaText: 'Vyžiadať ponuku',
      titleI18n: {
        sk: 'Letiskové transfery a súkromné cesty z Trenčína',
        en: 'Airport Transfers & Private Trips from Trenčín',
        de: 'Flughafentransfers & Privatfahrten ab Trenčín',
        ru: 'Трансферы в аэропорт и поездки из Тренчина',
        uk: 'Трансфери в аеропорт і поїздки з Тренчина',
      },
      subtitleI18n: {
        sk: 'Letiská Bratislava · Viedeň · Budapešť · cesty po Európe · dovoz vecí. Pevné ceny, 24/7, až 8 osôb.',
        en: 'Bratislava · Vienna · Budapest airports · trips across Europe · deliveries. Fixed prices, 24/7, up to 8 passengers.',
        de: 'Flughäfen Bratislava · Wien · Budapest · Reisen durch Europa · Lieferungen. Festpreise, 24/7, bis 8 Personen.',
        ru: 'Аэропорты Братислава · Вена · Будапешт · поездки по Европе · довоз вещей. Фиксированные цены, 24/7, до 8 пассажиров.',
        uk: 'Аеропорти Братислава · Відень · Будапешт · поїздки Європою · довіз речей. Фіксовані ціни, 24/7, до 8 пасажирів.',
      },
      ctaTextI18n: {
        sk: 'Vyžiadať ponuku',
        en: 'Request a quote',
        de: 'Angebot anfragen',
        ru: 'Запросить расчёт',
        uk: 'Запросити розрахунок',
      },
    },
  });

  // 3. LegalConfig
  await db.legalConfig.upsert({
    where: { storeId: store.id },
    update: {
      companyName: 'Transfer SK-EU',
      street: 'Trenčín',
      zip: '911 01',
      city: 'Trenčín',
      country: 'Slovensko',
      email: 'info@transfersk.eu',
      phone: '+421 900 000 000',
      vatId: 'SK0000000000',
    },
    create: {
      storeId: store.id,
      enabled: true,
      companyName: 'Transfer SK-EU',
      street: 'Trenčín',
      zip: '911 01',
      city: 'Trenčín',
      country: 'Slovensko',
      email: 'info@transfersk.eu',
      phone: '+421 900 000 000',
      vatId: 'SK0000000000',
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

  // 6. Services (category: 'service') — Vitaly's 3 offerings
  const services = [
    {
      slug: 'airport-transfers',
      sortOrder: 1,
      price: 90,
      nameKey: 'Airport Transfers',
      metadata: {
        nameI18n: { sk: 'Letiskové transfery', en: 'Airport Transfers', de: 'Flughafentransfers', ru: 'Трансферы в аэропорт', uk: 'Трансфери в аеропорт' },
        descI18n: {
          sk: 'Individuálne a skupinové transfery na letiská Bratislava, Viedeň, Budapešť a Praha. Minivan (5) alebo bus (8), pevné ceny.',
          en: 'Private and group transfers to Bratislava, Vienna, Budapest and Prague airports. Minivan (5) or bus (8), fixed prices.',
          de: 'Private und Gruppentransfers zu den Flughäfen Bratislava, Wien, Budapest und Prag. Minivan (5) oder Bus (8), Festpreise.',
          ru: 'Индивидуальные и групповые трансферы в аэропорты Братислава, Вена, Будапешт и Прага. Минивэн (5) или бус (8), фиксированные цены.',
          uk: 'Індивідуальні та групові трансфери в аеропорти Братислава, Відень, Будапешт і Прага. Мінівен (5) або бус (8), фіксовані ціни.',
        },
        priceLabelI18n: { sk: 'od 90 €', en: 'from 90 €', de: 'ab 90 €', ru: 'от 90 €', uk: 'від 90 €' },
      },
    },
    {
      slug: 'tourist-trips',
      sortOrder: 2,
      price: 85,
      nameKey: 'Tourist Trips',
      metadata: {
        nameI18n: { sk: 'Turistické cesty', en: 'Tourist Trips', de: 'Touristische Fahrten', ru: 'Туристические поездки', uk: 'Туристичні поїздки' },
        descI18n: {
          sk: 'Cesty po Európe so sprievodom — Chorvátsko, Taliansko, Slovinsko. Individuálne alebo skupiny od 4 osôb, aj zájazdy.',
          en: 'Guided trips across Europe — Croatia, Italy, Slovenia. Private or groups from 4 people, tours available.',
          de: 'Begleitete Reisen durch Europa — Kroatien, Italien, Slowenien. Privat oder Gruppen ab 4 Personen, auch Touren.',
          ru: 'Поездки по Европе с сопровождением — Хорватия, Италия, Словения. Индивидуально или группы от 4 человек, есть туры.',
          uk: 'Поїздки Європою із супроводом — Хорватія, Італія, Словенія. Індивідуально або групи від 4 осіб, є тури.',
        },
        priceLabelI18n: { sk: 'Chorvátsko od 85 €', en: 'Croatia from 85 €', de: 'Kroatien ab 85 €', ru: 'Хорватия от 85 €', uk: 'Хорватія від 85 €' },
      },
    },
    {
      slug: 'deliveries',
      sortOrder: 3,
      price: 1,
      nameKey: 'Deliveries',
      metadata: {
        nameI18n: { sk: 'Dovoz vecí', en: 'Deliveries', de: 'Lieferungen', ru: 'Довоз вещей', uk: 'Довіз речей' },
        descI18n: {
          sk: 'Doručenie osobných vecí a zásielok po Slovensku aj do zahraničia. Rýchlo a spoľahlivo.',
          en: 'Delivery of personal belongings and parcels within Slovakia and abroad. Fast and reliable.',
          de: 'Lieferung persönlicher Gegenstände und Pakete in der Slowakei und ins Ausland. Schnell und zuverlässig.',
          ru: 'Доставка личных вещей и посылок по Словакии и за рубеж. Быстро и надёжно.',
          uk: 'Доставка особистих речей і посилок Словаччиною та за кордон. Швидко й надійно.',
        },
        priceLabelI18n: { sk: '0,9 €/km', en: '0.9 €/km', de: '0,9 €/km', ru: '0,9 €/км', uk: '0,9 €/км' },
      },
    },
  ];
  for (const s of services) {
    await db.service.upsert({
      where: { storeId_slug: { storeId: store.id, slug: s.slug } },
      update: { nameKey: s.nameKey, price: s.price, duration: 0, sortOrder: s.sortOrder, category: 'service', metadata: s.metadata, active: true },
      create: { storeId: store.id, slug: s.slug, nameKey: s.nameKey, price: s.price, duration: 0, sortOrder: s.sortOrder, category: 'service', metadata: s.metadata, active: true },
    });
  }

  // 7. Leistungen (legacy — deactivated, replaced by services above)
  const leistungen = [
    { slug: 'flughafentransfer', nameKey: 'Flughafentransfer', price: 45, duration: 90, description: 'Zuverlässige Transfers zu allen Flughäfen in der Region Wien–Bratislava.' },
    { slug: 'businessfahrten', nameKey: 'Businessfahrten', price: 60, duration: 60, description: 'Diskrete und pünktliche Fahrten für Geschäftsreisende. Stille garantiert.' },
    { slug: 'events-ausfluege', nameKey: 'Events & Ausflüge', price: 50, duration: 120, description: 'Gruppenausflüge, Messen, Konzerte oder Hochzeiten — wir fahren Sie hin und zurück.' },
    { slug: 'langstrecke', nameKey: 'Langstrecke', price: 0, duration: 0, description: 'Fahrten quer durch Europa auf Anfrage. Preisanfrage per WhatsApp oder Formular.' },
  ];

  for (const l of leistungen) {
    await db.service.upsert({
      where: { storeId_slug: { storeId: store.id, slug: l.slug } },
      update: { price: l.price, description: l.description, active: false },
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
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  await db.adminUser.upsert({
    where: { email: 'makevytssvadym@gmail.com' },
    update: { passwordHash },
    create: {
      email: 'makevytssvadym@gmail.com',
      passwordHash,
      name: 'Admin',
      storeId: store.id,
    },
  });

  console.log('Transfer SK-EU seed complete!');
  console.log('   Store slug: transfer-sk-eu');
  console.log('   Admin: makevytssvadym@gmail.com / Admin123!');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
