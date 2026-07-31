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

  // 4. Routes (category: 'route') — Vitaly's real routes, 2 price tiers (minivan 5 / bus 8)
  const routes = [
    { slug: 'trencin-bratislava', price: 90, sortOrder: 1,
      nameI18n: { sk: 'Trenčín → Bratislava', en: 'Trenčín → Bratislava', de: 'Trenčín → Bratislava', ru: 'Тренчин → Братислава', uk: 'Тренчин → Братислава' },
      descI18n: { sk: 'Bus (8 miest): 120 €', en: 'Bus (8 seats): 120 €', de: 'Bus (8 Plätze): 120 €', ru: 'Бус (8 мест): 120 €', uk: 'Бус (8 місць): 120 €' } },
    { slug: 'trencin-letisko-vieden', price: 140, sortOrder: 2,
      nameI18n: { sk: 'Trenčín → Letisko Viedeň', en: 'Trenčín → Vienna Airport', de: 'Trenčín → Flughafen Wien', ru: 'Тренчин → Аэропорт Вена', uk: 'Тренчин → Аеропорт Відень' },
      descI18n: { sk: 'Bus (8 miest): 190 €', en: 'Bus (8 seats): 190 €', de: 'Bus (8 Plätze): 190 €', ru: 'Бус (8 мест): 190 €', uk: 'Бус (8 місць): 190 €' } },
    { slug: 'trencin-letisko-budapest', price: 250, sortOrder: 3,
      nameI18n: { sk: 'Trenčín → Letisko Budapešť', en: 'Trenčín → Budapest Airport', de: 'Trenčín → Flughafen Budapest', ru: 'Тренчин → Аэропорт Будапешт', uk: 'Тренчин → Аеропорт Будапешт' },
      descI18n: { sk: 'Bus (8 miest): 290 €', en: 'Bus (8 seats): 290 €', de: 'Bus (8 Plätze): 290 €', ru: 'Бус (8 мест): 290 €', uk: 'Бус (8 місць): 290 €' } },
    { slug: 'trencin-letisko-praha', price: 270, sortOrder: 4,
      nameI18n: { sk: 'Trenčín → Letisko Praha', en: 'Trenčín → Prague Airport', de: 'Trenčín → Flughafen Prag', ru: 'Тренчин → Аэропорт Прага', uk: 'Тренчин → Аеропорт Прага' },
      descI18n: { sk: 'Bus (8 miest): 330 €', en: 'Bus (8 seats): 330 €', de: 'Bus (8 Plätze): 330 €', ru: 'Бус (8 мест): 330 €', uk: 'Бус (8 місць): 330 €' } },
  ];

  // Remove all old routes for this store before upserting new ones
  await db.service.deleteMany({ where: { storeId: store.id, category: 'route' } });

  for (const r of routes) {
    const metadata = { nameI18n: r.nameI18n, descI18n: r.descI18n, featured: true };
    await db.service.upsert({
      where: { storeId_slug: { storeId: store.id, slug: r.slug } },
      update: { price: r.price, nameKey: r.nameI18n.en, sortOrder: r.sortOrder, description: null, metadata },
      create: {
        storeId: store.id,
        slug: r.slug,
        nameKey: r.nameI18n.en,
        price: r.price,
        duration: 0,
        sortOrder: r.sortOrder,
        category: 'route',
        description: null,
        active: true,
        metadata,
      },
    });
  }

  // 5. Fleet (category: 'fleet') — Vitaly's 2 vehicles (upsert preserves admin-uploaded photos)
  const fleet = [
    { slug: 'minivan-5', sortOrder: 1, nameKey: 'Peugeot 5008',
      metadata: { capacity: '5',
        nameI18n: { sk: 'Peugeot 5008', en: 'Peugeot 5008', de: 'Peugeot 5008', ru: 'Peugeot 5008', uk: 'Peugeot 5008' },
        descI18n: {
          sk: 'Pohodlný minivan pre max. 5 cestujúcich — klimatizácia a priestranný kufor. Ideálny na letiskové transfery a jazdy po meste.',
          en: 'Comfortable minivan for up to 5 passengers — air conditioning and a spacious boot. Ideal for airport transfers and city rides.',
          de: 'Komfortabler Minivan für bis zu 5 Fahrgäste — Klimaanlage und großer Kofferraum. Ideal für Flughafentransfers und Stadtfahrten.',
          ru: 'Комфортный минивэн до 5 пассажиров — кондиционер и вместительный багажник. Идеален для трансферов в аэропорт и поездок по городу.',
          uk: 'Комфортний мінівен до 5 пасажирів — кондиціонер і місткий багажник. Ідеальний для трансферів в аеропорт і поїздок містом.',
        },
      },
    },
    { slug: 'bus-8', sortOrder: 2, nameKey: 'Renault Trafic',
      metadata: { capacity: '8',
        nameI18n: { sk: 'Renault Trafic', en: 'Renault Trafic', de: 'Renault Trafic', ru: 'Renault Trafic', uk: 'Renault Trafic' },
        descI18n: {
          sk: 'Priestranný 8-miestny van — dosť miesta pre cestujúcich aj batožinu. Ideálny pre skupiny, zájazdy a prepravu vecí.',
          en: 'Spacious 8-seat van — plenty of room for passengers and luggage. Perfect for groups, tours and moving belongings.',
          de: 'Geräumiger 8-Sitzer-Van — viel Platz für Fahrgäste und Gepäck. Ideal für Gruppen, Touren und Transporte.',
          ru: 'Просторный 8-местный вэн — много места для пассажиров и багажа. Идеален для групп, туров и перевозки вещей.',
          uk: 'Просторий 8-місний вен — багато місця для пасажирів і багажу. Ідеальний для груп, турів і перевезення речей.',
        },
      },
    },
  ];

  for (const f of fleet) {
    await db.service.upsert({
      where: { storeId_slug: { storeId: store.id, slug: f.slug } },
      update: { nameKey: f.nameKey, sortOrder: f.sortOrder, description: null, metadata: f.metadata },
      create: {
        storeId: store.id,
        slug: f.slug,
        nameKey: f.nameKey,
        price: 0,
        duration: 0,
        sortOrder: f.sortOrder,
        description: null,
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
      nameKey: 'Deliveries & Moving',
      metadata: {
        nameI18n: { sk: 'Preprava vecí a sťahovanie', en: 'Deliveries & Moving', de: 'Transport & Umzüge', ru: 'Перевозка вещей и переезды', uk: 'Перевезення речей і переїзди' },
        descI18n: {
          sk: 'Preprava nábytku, osobných vecí a pomoc so sťahovaním — po Slovensku aj do zahraničia. Aj menšie zásielky. V Trenčíne 45 €, mimo mesta 0,9 €/km.',
          en: 'Furniture, personal belongings and moving help — within Slovakia and abroad. Parcels too. In Trenčín 45 €, outside 0.9 €/km.',
          de: 'Möbel, persönliche Gegenstände und Umzugshilfe — in der Slowakei und ins Ausland. Auch Pakete. In Trenčín 45 €, außerhalb 0,9 €/km.',
          ru: 'Мебель, личные вещи и помощь с переездом — по Словакии и за рубеж. Также посылки. В Тренчине 45 €, за городом 0,9 €/км.',
          uk: 'Меблі, особисті речі та допомога з переїздом — Словаччиною та за кордон. Також посилки. У Тренчині 45 €, за містом 0,9 €/км.',
        },
        priceLabelI18n: { sk: 'od 45 €', en: 'from 45 €', de: 'ab 45 €', ru: 'от 45 €', uk: 'від 45 €' },
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

  // 7. Testimonials — start empty; real reviews come via submit form + admin approval
  await db.testimonial.deleteMany({ where: { storeId: store.id } });

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
