import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { getActiveLocales, getDefaultLocale } from '@/config';
import { getBaseUrl } from '@/lib/url';
import { db } from '@/lib/db';
import styles from './preprava-veci.module.css';

const PHONE = '+421 951 287 892';
const PHONE_HREF = 'tel:+421951287892';
const WA_HREF = 'https://wa.me/421951287892';
const UPDATED = '2026-10-07';
const PAGE_SLUG = '/preprava-veci';

const CONTENT = {
  sk: {
    metaTitle: 'Preprava vecí a sťahovanie v Trenčíne a po Slovensku | Transfer SK-EU',
    metaDescription: 'Prevezieme nábytok, osobné veci a zásielky po Trenčíne, Slovensku aj do krajín EÚ. Pomoc s nakladaním. V Trenčíne 45 €, mimo mesta 0,9 €/km. 24/7.',
    h1: 'Preprava vecí a sťahovanie — Trenčín, Slovensko a EÚ',
    intro: 'Prevezieme nábytok, osobné veci, zásielky a pomôžeme so sťahovaním — po Trenčíne, celom Slovensku aj do ďalších krajín EÚ. Pevná cena: v Trenčíne 45 €, mimo mesta 0,9 €/km. Jazdíme s Peugeot 5008 a Renault Trafic, pomôžeme s nakladaním, k dispozícii 24/7.',
    cityLabel: 'V Trenčíne (paušál)',
    kmLabel: 'Mimo mesta (za km)',
    cta: `Objednať prepravu: ${PHONE}`,
    faq: [
      { q: 'Koľko stojí preprava vecí v Trenčíne?', a: 'V meste 45 €. Mimo Trenčína 0,9 € za kilometer. Prepravu do zahraničia (napr. Trenčín–Viedeň) vypočítame na požiadanie.' },
      { q: 'Čo prepravujete?', a: 'Nábytok, osobné veci, krabice, zásielky, bicykle a ďalší nadrozmer. Pomôžeme naložiť aj vyložiť.' },
      { q: 'Prepravujete aj do krajín EÚ?', a: 'Áno. Jazdíme po celom Slovensku a do susedných krajín EÚ — Rakúsko, Česko a ďalej. Trasu a cenu dohodneme vopred.' },
      { q: 'Ako si objednať prepravu?', a: `Zavolajte alebo napíšte na WhatsApp/Viber/Telegram ${PHONE} — poradíme cenu aj čas.` },
    ],
    home: 'Domov',
    breadcrumb: 'Preprava vecí',
    updatedLabel: 'Aktualizované',
    offerCityName: 'V Trenčíne (paušál)',
    offerKmName: 'Mimo mesta (€/km)',
  },
  de: {
    metaTitle: 'Transport von Sachen & Umzüge in Trenčín und in der Slowakei | Transfer SK-EU',
    metaDescription: 'Wir transportieren Möbel, persönliche Sachen und Pakete in Trenčín, in der Slowakei und in EU-Länder. Hilfe beim Beladen. In Trenčín 45 €, außerhalb 0,9 €/km. 24/7.',
    h1: 'Transport von Sachen & Umzüge — Trenčín, Slowakei und EU',
    intro: 'Wir transportieren Möbel, persönliche Sachen, Pakete und helfen beim Umzug — in Trenčín, in der ganzen Slowakei und in weitere EU-Länder. Festpreis: in Trenčín 45 €, außerhalb der Stadt 0,9 €/km. Wir fahren mit Peugeot 5008 und Renault Trafic, helfen beim Beladen und sind 24/7 erreichbar.',
    cityLabel: 'In Trenčín (Pauschale)',
    kmLabel: 'Außerhalb (pro km)',
    cta: `Transport bestellen: ${PHONE}`,
    faq: [
      { q: 'Was kostet der Transport von Sachen in Trenčín?', a: 'Innerhalb der Stadt 45 €. Außerhalb von Trenčín 0,9 € pro Kilometer. Transporte ins Ausland (z. B. Trenčín–Wien) berechnen wir auf Anfrage.' },
      { q: 'Was transportieren Sie?', a: 'Möbel, persönliche Sachen, Kartons, Pakete, Fahrräder und weitere sperrige Gegenstände. Wir helfen beim Be- und Entladen.' },
      { q: 'Fahren Sie auch in andere EU-Länder?', a: 'Ja. Wir fahren in der ganzen Slowakei und in die EU-Nachbarländer — Österreich, Tschechien und weiter. Route und Preis stimmen wir vorab ab.' },
      { q: 'Wie bestelle ich den Transport?', a: `Rufen Sie an oder schreiben Sie über WhatsApp/Viber/Telegram an ${PHONE} — wir nennen Preis und Zeit.` },
    ],
    home: 'Startseite',
    breadcrumb: 'Transport von Sachen',
    updatedLabel: 'Aktualisiert',
    offerCityName: 'In Trenčín (Pauschale)',
    offerKmName: 'Außerhalb (€/km)',
  },
  cs: {
    metaTitle: 'Přeprava věcí a stěhování v Trenčíně a po Slovensku | Transfer SK-EU',
    metaDescription: 'Převezeme nábytek, osobní věci a zásilky po Trenčíně, Slovensku i do zemí EU. Pomoc s nakládkou. V Trenčíně 45 €, mimo město 0,9 €/km. 24/7.',
    h1: 'Přeprava věcí a stěhování — Trenčín, Slovensko a EU',
    intro: 'Převezeme nábytek, osobní věci, zásilky a pomůžeme se stěhováním — po Trenčíně, celém Slovensku i do dalších zemí EU. Pevná cena: v Trenčíně 45 €, mimo město 0,9 €/km. Jezdíme s Peugeot 5008 a Renault Trafic, pomůžeme s nakládkou a jsme k dispozici 24/7.',
    cityLabel: 'V Trenčíně (paušál)',
    kmLabel: 'Mimo město (za km)',
    cta: `Objednat přepravu: ${PHONE}`,
    faq: [
      { q: 'Kolik stojí přeprava věcí v Trenčíně?', a: 'Ve městě 45 €. Mimo Trenčín 0,9 € za kilometr. Přepravu do zahraničí (např. Trenčín–Vídeň) spočítáme na vyžádání.' },
      { q: 'Co přepravujete?', a: 'Nábytek, osobní věci, krabice, zásilky, kola a další nadměrné předměty. Pomůžeme naložit i vyložit.' },
      { q: 'Jezdíte i do dalších zemí EU?', a: 'Ano. Jezdíme po celém Slovensku a do sousedních zemí EU — Rakousko, Česko a dál. Trasu a cenu domluvíme předem.' },
      { q: 'Jak si přepravu objednat?', a: `Zavolejte nebo napište na WhatsApp/Viber/Telegram ${PHONE} — poradíme cenu i čas.` },
    ],
    home: 'Domů',
    breadcrumb: 'Přeprava věcí',
    updatedLabel: 'Aktualizováno',
    offerCityName: 'V Trenčíně (paušál)',
    offerKmName: 'Mimo město (€/km)',
  },
  en: {
    metaTitle: 'Moving & Belongings Transport in Trenčín and across Slovakia | Transfer SK-EU',
    metaDescription: 'We move furniture, personal belongings and parcels in Trenčín, across Slovakia and to EU countries. Loading help included. In Trenčín €45, outside €0.9/km. 24/7.',
    h1: 'Moving & Belongings Transport — Trenčín, Slovakia and the EU',
    intro: 'We move furniture, personal belongings, parcels and help with relocations — in Trenčín, across Slovakia and to other EU countries. Fixed price: €45 within Trenčín, €0.9/km outside the city. We drive a Peugeot 5008 and Renault Trafic, help with loading, and are available 24/7.',
    cityLabel: 'Within Trenčín (flat rate)',
    kmLabel: 'Outside the city (per km)',
    cta: `Book transport: ${PHONE}`,
    faq: [
      { q: 'How much does moving belongings in Trenčín cost?', a: '€45 within the city. €0.9 per kilometre outside Trenčín. Cross-border moves (e.g. Trenčín–Vienna) are quoted on request.' },
      { q: 'What do you transport?', a: 'Furniture, personal belongings, boxes, parcels, bikes and other oversized items. We help load and unload.' },
      { q: 'Do you drive to other EU countries?', a: 'Yes. We cover all of Slovakia and neighbouring EU countries — Austria, Czechia and beyond. Route and price are agreed in advance.' },
      { q: 'How do I book?', a: `Call or message WhatsApp/Viber/Telegram at ${PHONE} — we'll confirm price and time.` },
    ],
    home: 'Home',
    breadcrumb: 'Belongings transport',
    updatedLabel: 'Updated',
    offerCityName: 'Within Trenčín (flat rate)',
    offerKmName: 'Outside city (€/km)',
  },
  ru: {
    metaTitle: 'Перевозка вещей и переезды в Тренчине и по Словакии | Transfer SK-EU',
    metaDescription: 'Перевезём мебель, личные вещи и посылки по Тренчину, Словакии и в страны ЕС. Помощь с погрузкой. В Тренчине 45 €, за городом 0,9 €/км. 24/7.',
    h1: 'Перевозка вещей и переезды — Тренчин, Словакия и ЕС',
    intro: 'Перевезём мебель, личные вещи, посылки и поможем с переездом — по Тренчину, всей Словакии и в другие страны ЕС. Фиксированная цена: в Тренчине 45 €, за городом 0,9 €/км. Работаем на Peugeot 5008 и Renault Trafic, помогаем с погрузкой, на связи 24/7.',
    cityLabel: 'По Тренчину (фиксировано)',
    kmLabel: 'За городом (за км)',
    cta: `Заказать перевозку: ${PHONE}`,
    faq: [
      { q: 'Сколько стоит перевозка вещей в Тренчине?', a: 'В черте города — 45 €. За пределами Тренчина — 0,9 € за километр. Перевозку за границу (например, Тренчин–Вена) рассчитываем по запросу.' },
      { q: 'Что вы перевозите?', a: 'Мебель, личные вещи, коробки, посылки, велосипеды и другой негабарит. Помогаем загрузить и выгрузить.' },
      { q: 'Возите ли вы в другие страны ЕС?', a: 'Да. Возим по всей Словакии и в соседние страны ЕС — Австрию, Чехию и далее. Маршрут и цену согласуем заранее.' },
      { q: 'Как заказать перевозку?', a: `Позвоните или напишите в WhatsApp/Viber/Telegram на ${PHONE} — подскажем цену и время.` },
    ],
    home: 'Главная',
    breadcrumb: 'Перевозка вещей',
    updatedLabel: 'Обновлено',
    offerCityName: 'По Тренчину (фиксировано)',
    offerKmName: 'За городом (€/км)',
  },
  uk: {
    metaTitle: 'Вантажні перевезення та переїзди в Тренчині та по Словаччині | Transfer SK-EU',
    metaDescription: 'Перевеземо меблі, особисті речі та посилки по Тренчину, Словаччині та в країни ЄС. Допомога із завантаженням. У Тренчині 45 €, за містом 0,9 €/км. 24/7.',
    h1: 'Вантажні перевезення та переїзди — Тренчин, Словаччина та ЄС',
    intro: 'Перевеземо меблі, особисті речі, посилки та допоможемо з переїздом — по Тренчину, всій Словаччині та в інші країни ЄС. Фіксована ціна: у Тренчині 45 €, за містом 0,9 €/км. Їздимо на Peugeot 5008 і Renault Trafic, допомагаємо із завантаженням, на зв\'язку 24/7.',
    cityLabel: 'У Тренчині (фіксовано)',
    kmLabel: 'За містом (за км)',
    cta: `Замовити перевезення: ${PHONE}`,
    faq: [
      { q: 'Скільки коштує перевезення речей у Тренчині?', a: 'У межах міста 45 €. За містом 0,9 € за кілометр. Перевезення за кордон (напр., Тренчин–Відень) рахуємо за запитом.' },
      { q: 'Що ви перевозите?', a: 'Меблі, особисті речі, коробки, посилки, велосипеди та інший негабарит. Допоможемо завантажити й вивантажити.' },
      { q: 'Чи возите в інші країни ЄС?', a: 'Так. Їздимо по всій Словаччині та в сусідні країни ЄС — Австрію, Чехію й далі. Маршрут і ціну узгоджуємо заздалегідь.' },
      { q: 'Як замовити перевезення?', a: `Зателефонуйте або напишіть у WhatsApp/Viber/Telegram на ${PHONE} — підкажемо ціну й час.` },
    ],
    home: 'Головна',
    breadcrumb: 'Вантажні перевезення',
    updatedLabel: 'Оновлено',
    offerCityName: 'У Тренчині (фіксовано)',
    offerKmName: 'За містом (€/км)',
  },
} as const;

type LocaleKey = keyof typeof CONTENT;

type CargoMeta = {
  pageSlug?: string;
  pricePerKm?: number;
  [key: string]: unknown;
};

async function getCargoService(storeSlug: string) {
  try {
    const store = await db.store.findUnique({ where: { slug: storeSlug }, select: { id: true } });
    if (!store) return null;
    const services = await db.service.findMany({
      where: { storeId: store.id, active: true, category: { notIn: ['route', 'fleet'] } },
      select: { price: true, metadata: true },
    });
    return services.find(
      (s) => (s.metadata as CargoMeta | null)?.pageSlug === PAGE_SLUG,
    ) ?? null;
  } catch {
    return null;
  }
}

export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = CONTENT[locale as LocaleKey] ?? CONTENT.sk;
  const baseUrl = getBaseUrl();
  const languages = Object.fromEntries(
    getActiveLocales().map((l) => [l, `${baseUrl}/${l}${PAGE_SLUG}`]),
  );
  languages['x-default'] = `${baseUrl}/${getDefaultLocale()}${PAGE_SLUG}`;
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: {
      canonical: `${baseUrl}/${locale}${PAGE_SLUG}`,
      languages,
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      type: 'website',
      url: `${baseUrl}/${locale}${PAGE_SLUG}`,
    },
  };
}

export default async function PrepravaVeciPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  const c = CONTENT[locale as LocaleKey] ?? CONTENT.sk;
  const baseUrl = getBaseUrl();
  const storeSlug = process.env.STORE_SLUG ?? '';

  const cargoService = await getCargoService(storeSlug);
  const cityPrice = cargoService?.price ?? 45;
  const perKmPrice = (cargoService?.metadata as CargoMeta | null)?.pricePerKm ?? 0.9;

  const serviceUrl = `${baseUrl}/${locale}${PAGE_SLUG}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: c.home, item: `${baseUrl}/${locale}` },
        { '@type': 'ListItem', position: 2, name: c.breadcrumb, item: serviceUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Moving / cargo transport',
      name: c.h1,
      description: c.metaDescription,
      url: serviceUrl,
      areaServed: [
        { '@type': 'City', name: 'Trenčín' },
        { '@type': 'Country', name: 'Slovakia' },
        { '@type': 'Continent', name: 'Europe' },
      ],
      provider: {
        '@type': 'LocalBusiness',
        '@id': `${baseUrl}/#business`,
      },
      offers: [
        {
          '@type': 'Offer',
          priceCurrency: 'EUR',
          price: String(cityPrice),
          name: c.offerCityName,
          availability: 'https://schema.org/InStock',
          url: serviceUrl,
        },
        {
          '@type': 'Offer',
          priceCurrency: 'EUR',
          price: String(perKmPrice),
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: String(perKmPrice),
            priceCurrency: 'EUR',
            unitCode: 'KMT',
          },
          name: c.offerKmName,
          availability: 'https://schema.org/InStock',
          url: serviceUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: c.faq.map((it) => ({
        '@type': 'Question',
        name: it.q,
        acceptedAnswer: { '@type': 'Answer', text: it.a },
      })),
    },
  ];

  return (
    <div className={styles.wrap}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href={`/${locale}`}>{c.home}</Link>
        <span className={styles.crumbSep}>›</span>
        <span>{c.breadcrumb}</span>
      </nav>

      <h1 className={styles.title}>{c.h1}</h1>
      <p className={styles.intro}>{c.intro}</p>

      <div className={styles.priceBlock}>
        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>{c.cityLabel}</span>
          <span className={styles.priceValue}>{cityPrice} €</span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>{c.kmLabel}</span>
          <span className={styles.priceValue}>{perKmPrice} €/km</span>
        </div>
      </div>

      <div className={styles.ctaRow}>
        <a href={PHONE_HREF} className={styles.ctaPrimary}>{c.cta}</a>
        <a href={WA_HREF} className={styles.ctaWhats} target="_blank" rel="noopener noreferrer">
          WhatsApp / Viber / Telegram
        </a>
      </div>

      <section className={styles.faq}>
        {c.faq.map((item, i) => (
          <div key={i} className={styles.faqItem}>
            <h2 className={styles.faqQ}>{item.q}</h2>
            <p className={styles.faqA}>{item.a}</p>
          </div>
        ))}
      </section>

      <p className={styles.updated}>
        {c.updatedLabel}: <time dateTime={UPDATED}>{UPDATED}</time>
      </p>
    </div>
  );
}
