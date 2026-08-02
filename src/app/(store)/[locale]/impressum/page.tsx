import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import styles from '../legal.module.css';

const BACK: Record<string, string> = {
  sk: '← Späť na hlavnú stránku',
  cs: '← Zpět na hlavní stránku',
  de: '← Zurück zur Startseite',
  en: '← Back to homepage',
  ru: '← На главную',
  uk: '← На головну',
};

type Content = {
  title: string;
  subtitle: string;
  operator: string;
  contact: string;
  phone: string;
  ids: string;
  notVat: string;
  activityHeading: string;
  activity: string;
  disclaimerHeading: string;
  disclaimer: string;
};

const CONTENT: Record<string, Content> = {
  sk: {
    title: 'Prevádzkovateľ',
    subtitle: 'Informácie o prevádzkovateľovi',
    operator: 'Prevádzkovateľ',
    contact: 'Kontakt',
    phone: 'Telefón',
    ids: 'Identifikačné údaje',
    notVat: 'Neplatca DPH',
    activityHeading: 'Predmet podnikania',
    activity: 'Osobná cestná doprava — taxislužba / prenájom vozidla s vodičom. Preukaz vodiča vozidla taxislužby č. T45487, vydaný dňa 11. 07. 2025, Okresný úrad Trenčín, odbor cestnej dopravy a pozemných komunikácií.',
    disclaimerHeading: 'Vylúčenie zodpovednosti',
    disclaimer: 'Napriek starostlivej kontrole obsahu nepreberáme zodpovednosť za obsah externých odkazov. Za obsah odkazovaných stránok zodpovedajú výlučne ich prevádzkovatelia.',
  },
  cs: {
    title: 'Provozovatel',
    subtitle: 'Informace o provozovateli',
    operator: 'Provozovatel',
    contact: 'Kontakt',
    phone: 'Telefon',
    ids: 'Identifikační údaje',
    notVat: 'Neplátce DPH',
    activityHeading: 'Předmět podnikání',
    activity: 'Osobní silniční doprava — taxislužba / pronájem vozidla s řidičem. Průkaz řidiče vozidla taxislužby č. T45487, vydaný dne 11. 07. 2025, Okresní úřad Trenčín, odbor silniční dopravy a pozemních komunikací.',
    disclaimerHeading: 'Vyloučení odpovědnosti',
    disclaimer: 'I přes pečlivou kontrolu obsahu nepřebíráme odpovědnost za obsah externích odkazů. Za obsah odkazovaných stránek odpovídají výhradně jejich provozovatelé.',
  },
  de: {
    title: 'Impressum',
    subtitle: 'Angaben zum Betreiber',
    operator: 'Betreiber',
    contact: 'Kontakt',
    phone: 'Telefon',
    ids: 'Identifikationsdaten',
    notVat: 'Kein Umsatzsteuerzahler',
    activityHeading: 'Geschäftstätigkeit',
    activity: 'Personenbeförderung im Straßenverkehr — Taxidienst / Mietwagen mit Fahrer. Fahrerausweis für Taxifahrzeuge Nr. T45487, ausgestellt am 11. 07. 2025, Bezirksamt Trenčín, Abteilung für Straßen- und Landverkehr.',
    disclaimerHeading: 'Haftungsausschluss',
    disclaimer: 'Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.',
  },
  en: {
    title: 'Legal Notice',
    subtitle: 'Provider information',
    operator: 'Operator',
    contact: 'Contact',
    phone: 'Phone',
    ids: 'Identification',
    notVat: 'Not a VAT payer',
    activityHeading: 'Business activity',
    activity: 'Passenger road transport — taxi service / rental car with driver. Taxi driver licence No. T45487, issued on 11 July 2025 by the District Office Trenčín, Department of Road Transport.',
    disclaimerHeading: 'Disclaimer',
    disclaimer: 'Despite careful content control, we assume no liability for the content of external links. The operators of the linked pages are solely responsible for their content.',
  },
  ru: {
    title: 'Правовая информация',
    subtitle: 'Сведения о поставщике услуг',
    operator: 'Оператор',
    contact: 'Контакты',
    phone: 'Телефон',
    ids: 'Реквизиты',
    notVat: 'Не плательщик НДС',
    activityHeading: 'Вид деятельности',
    activity: 'Пассажирские автомобильные перевозки — такси / аренда автомобиля с водителем. Удостоверение водителя такси № T45487, выдано 11.07.2025, Окружное управление Тренчин, отдел дорожного транспорта.',
    disclaimerHeading: 'Отказ от ответственности',
    disclaimer: 'Несмотря на тщательную проверку содержания, мы не несём ответственности за содержание внешних ссылок. За содержание страниц, на которые ведут ссылки, отвечают исключительно их операторы.',
  },
  uk: {
    title: 'Правова інформація',
    subtitle: 'Відомості про постачальника послуг',
    operator: 'Оператор',
    contact: 'Контакти',
    phone: 'Телефон',
    ids: 'Реквізити',
    notVat: 'Не платник ПДВ',
    activityHeading: 'Вид діяльності',
    activity: 'Пасажирські автомобільні перевезення — таксі / оренда автомобіля з водієм. Посвідчення водія таксі № T45487, видане 11.07.2025, Окружне управління Тренчин, відділ дорожнього транспорту.',
    disclaimerHeading: 'Відмова від відповідальності',
    disclaimer: 'Незважаючи на ретельну перевірку вмісту, ми не несемо відповідальності за вміст зовнішніх посилань. За вміст сторінок, на які ведуть посилання, відповідають виключно їхні оператори.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const c = CONTENT[locale] ?? CONTENT.sk;
  return { title: `${c.title} | Transfer SK-EU`, robots: { index: false } };
}

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = CONTENT[locale] ?? CONTENT.sk;
  const back = BACK[locale] ?? BACK.sk;

  return (
    <main className={styles.legal}>
      <div className={styles.legal__inner}>
        <Link href={`/${locale}`} className={styles.legal__back}>{back}</Link>
        <h1 className={styles.legal__title}>{c.title}</h1>
        <p className={styles.legal__subtitle}>{c.subtitle}</p>

        <section className={styles.legal__section}>
          <h2>{c.operator}</h2>
          <p>Vitalii Khilko<br />
          K. Šmidkeho 2938/8<br />
          911 08 Trenčín, Slovensko</p>
        </section>

        <section className={styles.legal__section}>
          <h2>{c.contact}</h2>
          <p>{c.phone}: +421 951 287 892<br />
          E-mail: info@transfersk.eu</p>
        </section>

        <section className={styles.legal__section}>
          <h2>{c.ids}</h2>
          <p>IČO: 57093865<br />
          DIČ: 3120653360<br />
          {c.notVat}</p>
        </section>

        <section className={styles.legal__section}>
          <h2>{c.activityHeading}</h2>
          <p>{c.activity}</p>
        </section>

        <section className={styles.legal__section}>
          <h2>{c.disclaimerHeading}</h2>
          <p>{c.disclaimer}</p>
        </section>
      </div>
    </main>
  );
}
