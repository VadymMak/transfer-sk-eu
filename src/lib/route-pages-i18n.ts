// src/lib/route-pages-i18n.ts
// UI strings + per-route FAQ for the route landing pages, in all site locales.
// Kept in one place so the page component stays lean. pl falls back to en.

export interface RouteStrings {
  home: string;
  routesCrumb: string;
  fixedPrice: string;
  subtitle: (dest: string) => string;
  intro: (a: { dest: string; dist: number; dur: string; van: number; bus: number }) => string;
  priceTitle: string;
  thVehicle: string;
  thCapacity: string;
  thPrice: string;
  minivan: string;
  upTo5: string;
  bus: string;
  upTo8: string;
  distanceLabel: string;
  durationLabel: string;
  km: string;
  hUnit: string;
  minUnit: string;
  includedTitle: string;
  included: string[];
  cta: string;
  ctaWhats: string;
  otherTitle: string;
  faqTitle: string;
  faq: (a: { dest: string; dur: string; dist: number; van: number; bus: number }) => { q: string; a: string }[];
}

const de: RouteStrings = {
  home: 'Startseite',
  routesCrumb: 'Strecken',
  fixedPrice: 'Festpreis',
  subtitle: (d) => `Privater Transfer ab Trenčín nach ${d} — Festpreis, 24/7, professioneller Fahrer.`,
  intro: ({ dest, dist, dur, van, bus }) =>
    `Privater Tür-zu-Tür-Transfer von Trenčín nach ${dest}. Feste Preise pro Fahrzeug ohne versteckte Gebühren: ${van} € im Minivan (bis 5 Personen) und ${bus} € im Van (bis 8 Personen). Die Strecke ist ca. ${dist} km lang, die Fahrzeit beträgt etwa ${dur}. Verfügbar rund um die Uhr, auch für frühe Flüge und Nachtankünfte.`,
  priceTitle: 'Preis',
  thVehicle: 'Fahrzeug',
  thCapacity: 'Kapazität',
  thPrice: 'Festpreis',
  minivan: 'Minivan',
  upTo5: 'bis 5 Personen',
  bus: 'Van',
  upTo8: 'bis 8 Personen',
  distanceLabel: 'Entfernung',
  durationLabel: 'Fahrzeit',
  km: 'km',
  hUnit: 'Std.',
  minUnit: 'Min.',
  includedTitle: 'Inklusive',
  included: [
    'Festpreis pro Fahrzeug, keine versteckten Gebühren',
    'Professioneller, mehrsprachiger Fahrer',
    'Tür-zu-Tür-Abholung',
    '24/7 verfügbar — auch nachts und früh morgens',
    'Kindersitze auf Anfrage kostenlos',
    'Flugverfolgung & Wartezeit inklusive',
  ],
  cta: 'Diesen Transfer anfragen',
  ctaWhats: 'WhatsApp',
  otherTitle: 'Weitere Strecken',
  faqTitle: 'Häufige Fragen',
  faq: ({ dest, dur, dist, van, bus }) => [
    { q: `Was kostet der Transfer Trenčín → ${dest}?`, a: `${van} € im Minivan (bis 5 Personen) und ${bus} € im Van (bis 8 Personen). Festpreis pro Fahrzeug, keine versteckten Gebühren.` },
    { q: 'Wie lange dauert die Fahrt?', a: `Etwa ${dur}, ca. ${dist} km.` },
    { q: 'Welche Zahlungsarten akzeptieren Sie?', a: 'Barzahlung und Kreditkarte (EUR).' },
    { q: 'Gibt es Kindersitze?', a: 'Ja, Kindersitze sind auf Anfrage kostenlos — bitte bei der Buchung angeben.' },
    { q: 'Sind Sie rund um die Uhr verfügbar?', a: 'Ja, wir fahren 24/7 — auch für frühe Flüge und Nachtankünfte.' },
  ],
};

const sk: RouteStrings = {
  home: 'Domov',
  routesCrumb: 'Trasy',
  fixedPrice: 'Pevná cena',
  subtitle: (d) => `Súkromný transfer z Trenčína do ${d} — pevná cena, 24/7, profesionálny vodič.`,
  intro: ({ dest, dist, dur, van, bus }) =>
    `Súkromný transfer od dverí k dverám z Trenčína do ${dest}. Pevné ceny za vozidlo bez skrytých poplatkov: ${van} € minivan (do 5 osôb) a ${bus} € bus (do 8 osôb). Trasa má približne ${dist} km, čas jazdy je asi ${dur}. K dispozícii nonstop — aj skoré lety a nočné prílety.`,
  priceTitle: 'Cena',
  thVehicle: 'Vozidlo',
  thCapacity: 'Kapacita',
  thPrice: 'Pevná cena',
  minivan: 'Minivan',
  upTo5: 'do 5 osôb',
  bus: 'Bus',
  upTo8: 'do 8 osôb',
  distanceLabel: 'Vzdialenosť',
  durationLabel: 'Čas jazdy',
  km: 'km',
  hUnit: 'h',
  minUnit: 'min',
  includedTitle: 'V cene',
  included: [
    'Pevná cena za vozidlo, žiadne skryté poplatky',
    'Profesionálny viacjazyčný vodič',
    'Vyzdvihnutie od dverí k dverám',
    'Dostupné 24/7 — aj v noci a skoro ráno',
    'Detské sedačky na požiadanie zdarma',
    'Sledovanie letu a čakanie v cene',
  ],
  cta: 'Vyžiadať tento transfer',
  ctaWhats: 'WhatsApp',
  otherTitle: 'Ďalšie trasy',
  faqTitle: 'Časté otázky',
  faq: ({ dest, dur, dist, van, bus }) => [
    { q: `Koľko stojí transfer Trenčín → ${dest}?`, a: `${van} € minivan (do 5 osôb) a ${bus} € bus (do 8 osôb). Pevná cena za vozidlo bez skrytých poplatkov.` },
    { q: 'Ako dlho trvá cesta?', a: `Približne ${dur}, asi ${dist} km.` },
    { q: 'Aké spôsoby platby akceptujete?', a: 'Hotovosť a platobná karta (EUR).' },
    { q: 'Sú k dispozícii detské sedačky?', a: 'Áno, detské sedačky sú na požiadanie zdarma — uveďte ich pri objednávke.' },
    { q: 'Ste dostupní nonstop?', a: 'Áno, jazdíme 24/7 — aj skoré lety a nočné prílety.' },
  ],
};

const cs: RouteStrings = {
  home: 'Domů',
  routesCrumb: 'Trasy',
  fixedPrice: 'Pevná cena',
  subtitle: (d) => `Soukromý transfer z Trenčína do ${d} — pevná cena, 24/7, profesionální řidič.`,
  intro: ({ dest, dist, dur, van, bus }) =>
    `Soukromý transfer ode dveří ke dveřím z Trenčína do ${dest}. Pevné ceny za vozidlo bez skrytých poplatků: ${van} € minivan (do 5 osob) a ${bus} € bus (do 8 osob). Trasa měří přibližně ${dist} km, doba jízdy je asi ${dur}. K dispozici nonstop — i brzké lety a noční přílety.`,
  priceTitle: 'Cena',
  thVehicle: 'Vozidlo',
  thCapacity: 'Kapacita',
  thPrice: 'Pevná cena',
  minivan: 'Minivan',
  upTo5: 'do 5 osob',
  bus: 'Bus',
  upTo8: 'do 8 osob',
  distanceLabel: 'Vzdálenost',
  durationLabel: 'Doba jízdy',
  km: 'km',
  hUnit: 'h',
  minUnit: 'min',
  includedTitle: 'V ceně',
  included: [
    'Pevná cena za vozidlo, žádné skryté poplatky',
    'Profesionální vícejazyčný řidič',
    'Vyzvednutí ode dveří ke dveřím',
    'Dostupné 24/7 — i v noci a brzy ráno',
    'Dětské sedačky na vyžádání zdarma',
    'Sledování letu a čekání v ceně',
  ],
  cta: 'Poptat tento transfer',
  ctaWhats: 'WhatsApp',
  otherTitle: 'Další trasy',
  faqTitle: 'Časté dotazy',
  faq: ({ dest, dur, dist, van, bus }) => [
    { q: `Kolik stojí transfer Trenčín → ${dest}?`, a: `${van} € minivan (do 5 osob) a ${bus} € bus (do 8 osob). Pevná cena za vozidlo bez skrytých poplatků.` },
    { q: 'Jak dlouho cesta trvá?', a: `Přibližně ${dur}, asi ${dist} km.` },
    { q: 'Jaké způsoby platby přijímáte?', a: 'Hotovost a platební karta (EUR).' },
    { q: 'Jsou k dispozici dětské sedačky?', a: 'Ano, dětské sedačky jsou na vyžádání zdarma — uveďte je při objednávce.' },
    { q: 'Jste dostupní nonstop?', a: 'Ano, jezdíme 24/7 — i brzké lety a noční přílety.' },
  ],
};

const en: RouteStrings = {
  home: 'Home',
  routesCrumb: 'Routes',
  fixedPrice: 'Fixed price',
  subtitle: (d) => `Private transfer from Trenčín to ${d} — fixed price, 24/7, professional driver.`,
  intro: ({ dest, dist, dur, van, bus }) =>
    `Private door-to-door transfer from Trenčín to ${dest}. Fixed prices per vehicle, no hidden fees: €${van} in the minivan (up to 5 passengers) and €${bus} in the van (up to 8 passengers). The route is about ${dist} km and takes roughly ${dur}. Available 24/7 — including early flights and night arrivals.`,
  priceTitle: 'Price',
  thVehicle: 'Vehicle',
  thCapacity: 'Capacity',
  thPrice: 'Fixed price',
  minivan: 'Minivan',
  upTo5: 'up to 5 passengers',
  bus: 'Van',
  upTo8: 'up to 8 passengers',
  distanceLabel: 'Distance',
  durationLabel: 'Driving time',
  km: 'km',
  hUnit: 'h',
  minUnit: 'min',
  includedTitle: "What's included",
  included: [
    'Fixed price per vehicle, no hidden fees',
    'Professional, multilingual driver',
    'Door-to-door pickup',
    'Available 24/7 — including nights and early mornings',
    'Child seats free on request',
    'Flight tracking & waiting time included',
  ],
  cta: 'Request this transfer',
  ctaWhats: 'WhatsApp',
  otherTitle: 'Other routes',
  faqTitle: 'FAQ',
  faq: ({ dest, dur, dist, van, bus }) => [
    { q: `How much is the Trenčín → ${dest} transfer?`, a: `€${van} in the minivan (up to 5 passengers) and €${bus} in the van (up to 8 passengers). Fixed price per vehicle, no hidden fees.` },
    { q: 'How long does the trip take?', a: `About ${dur}, roughly ${dist} km.` },
    { q: 'What payment methods do you accept?', a: 'Cash and credit card (EUR).' },
    { q: 'Are child seats available?', a: 'Yes, child seats are free on request — please mention it when booking.' },
    { q: 'Are you available 24/7?', a: 'Yes, we drive 24/7 — including early flights and night arrivals.' },
  ],
};

const ru: RouteStrings = {
  home: 'Главная',
  routesCrumb: 'Маршруты',
  fixedPrice: 'Фиксированная цена',
  subtitle: (d) => `Индивидуальный трансфер из Тренчина в ${d} — фиксированная цена, 24/7, профессиональный водитель.`,
  intro: ({ dest, dist, dur, van, bus }) =>
    `Индивидуальный трансфер «от двери до двери» из Тренчина в ${dest}. Фиксированные цены за автомобиль без скрытых сборов: ${van} € минивэн (до 5 человек) и ${bus} € бус (до 8 человек). Маршрут около ${dist} км, время в пути примерно ${dur}. Доступно круглосуточно — включая ранние рейсы и ночные прилёты.`,
  priceTitle: 'Цена',
  thVehicle: 'Автомобиль',
  thCapacity: 'Вместимость',
  thPrice: 'Фиксированная цена',
  minivan: 'Минивэн',
  upTo5: 'до 5 человек',
  bus: 'Бус',
  upTo8: 'до 8 человек',
  distanceLabel: 'Расстояние',
  durationLabel: 'Время в пути',
  km: 'км',
  hUnit: 'ч',
  minUnit: 'мин',
  includedTitle: 'Включено',
  included: [
    'Фиксированная цена за автомобиль, без скрытых сборов',
    'Профессиональный водитель со знанием языков',
    'Подача «от двери до двери»',
    'Доступно 24/7 — включая ночь и раннее утро',
    'Детские кресла по запросу бесплатно',
    'Отслеживание рейса и ожидание включены',
  ],
  cta: 'Заказать этот трансфер',
  ctaWhats: 'WhatsApp',
  otherTitle: 'Другие маршруты',
  faqTitle: 'Частые вопросы',
  faq: ({ dest, dur, dist, van, bus }) => [
    { q: `Сколько стоит трансфер Тренчин → ${dest}?`, a: `${van} € минивэн (до 5 человек) и ${bus} € бус (до 8 человек). Фиксированная цена за автомобиль без скрытых сборов.` },
    { q: 'Сколько времени занимает поездка?', a: `Примерно ${dur}, около ${dist} км.` },
    { q: 'Какие способы оплаты вы принимаете?', a: 'Наличные и банковская карта (EUR).' },
    { q: 'Есть ли детские кресла?', a: 'Да, детские кресла предоставляются бесплатно по запросу — укажите это при заказе.' },
    { q: 'Вы работаете круглосуточно?', a: 'Да, мы ездим 24/7 — включая ранние рейсы и ночные прилёты.' },
  ],
};

const uk: RouteStrings = {
  home: 'Головна',
  routesCrumb: 'Маршрути',
  fixedPrice: 'Фіксована ціна',
  subtitle: (d) => `Індивідуальний трансфер із Тренчина до ${d} — фіксована ціна, 24/7, професійний водій.`,
  intro: ({ dest, dist, dur, van, bus }) =>
    `Індивідуальний трансфер «від дверей до дверей» із Тренчина до ${dest}. Фіксовані ціни за автомобіль без прихованих зборів: ${van} € мінівен (до 5 осіб) і ${bus} € бус (до 8 осіб). Маршрут близько ${dist} км, час у дорозі приблизно ${dur}. Доступно цілодобово — включно з ранніми рейсами та нічними прильотами.`,
  priceTitle: 'Ціна',
  thVehicle: 'Автомобіль',
  thCapacity: 'Місткість',
  thPrice: 'Фіксована ціна',
  minivan: 'Мінівен',
  upTo5: 'до 5 осіб',
  bus: 'Бус',
  upTo8: 'до 8 осіб',
  distanceLabel: 'Відстань',
  durationLabel: 'Час у дорозі',
  km: 'км',
  hUnit: 'год',
  minUnit: 'хв',
  includedTitle: 'Включено',
  included: [
    'Фіксована ціна за автомобіль, без прихованих зборів',
    'Професійний водій зі знанням мов',
    'Подача «від дверей до дверей»',
    'Доступно 24/7 — включно з ніччю та раннім ранком',
    'Дитячі крісла за запитом безкоштовно',
    'Відстеження рейсу та очікування включені',
  ],
  cta: 'Замовити цей трансфер',
  ctaWhats: 'WhatsApp',
  otherTitle: 'Інші маршрути',
  faqTitle: 'Часті запитання',
  faq: ({ dest, dur, dist, van, bus }) => [
    { q: `Скільки коштує трансфер Тренчин → ${dest}?`, a: `${van} € мінівен (до 5 осіб) і ${bus} € бус (до 8 осіб). Фіксована ціна за автомобіль без прихованих зборів.` },
    { q: 'Скільки часу займає поїздка?', a: `Приблизно ${dur}, близько ${dist} км.` },
    { q: 'Які способи оплати ви приймаєте?', a: 'Готівка та банківська картка (EUR).' },
    { q: 'Чи є дитячі крісла?', a: 'Так, дитячі крісла надаються безкоштовно за запитом — вкажіть це при замовленні.' },
    { q: 'Ви працюєте цілодобово?', a: 'Так, ми їздимо 24/7 — включно з ранніми рейсами та нічними прильотами.' },
  ],
};

const STRINGS: Record<string, RouteStrings> = { de, sk, cs, en, ru, uk, pl: en };

export function routeStrings(locale: string): RouteStrings {
  return STRINGS[locale] ?? en;
}

/** Format minutes as a localized "~1 h 30 min" string. */
export function formatDuration(min: number, s: RouteStrings): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} ${s.minUnit}`;
  if (m === 0) return `${h} ${s.hUnit}`;
  return `${h} ${s.hUnit} ${m} ${s.minUnit}`;
}
