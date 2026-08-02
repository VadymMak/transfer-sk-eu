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
  s1h: string;
  s2h: string; s2b: string;
  s3h: string; s3b: string;
  s4h: string; s4b: string;
  s5h: string; s5b: string;
  s6h: string; s6b: string;
  s7h: string; s7b: string;
};

const CONTENT: Record<string, Content> = {
  sk: {
    title: 'Ochrana osobných údajov',
    subtitle: 'Podľa GDPR (EU) 2016/679',
    s1h: '1. Prevádzkovateľ',
    s2h: '2. Aké údaje spracúvame',
    s2b: 'Pri použití dopytového formulára spracúvame tieto osobné údaje: meno, telefónne číslo, miesto odchodu a príchodu, dátum a čas cesty, číslo letu (voliteľné) a voliteľné správy.',
    s3h: '3. Účel spracúvania',
    s3b: 'Získané údaje spracúvame výlučne na vybavenie Vašej žiadosti o transfer a na komunikáciu s Vami (napríklad cez WhatsApp).',
    s4h: '4. Právny základ',
    s4b: 'Čl. 6 ods. 1 písm. b GDPR (plnenie zmluvy, resp. predzmluvné opatrenia).',
    s5h: '5. Doba uchovávania',
    s5b: 'Vaše údaje uchovávame len po dobu nevyhnutnú na realizáciu transferu, najdlhšie však 7 rokov (zákonná archivačná povinnosť).',
    s6h: '6. Vaše práva',
    s6b: 'Máte právo na prístup k údajom, ich opravu, vymazanie, obmedzenie spracúvania a na prenosnosť údajov. V týchto veciach nás kontaktujte na: info@transfersk.eu',
    s7h: '7. Právo podať sťažnosť',
    s7b: 'Máte právo podať sťažnosť dozornému orgánu — Úrad na ochranu osobných údajov Slovenskej republiky (dataprotection.gov.sk).',
  },
  cs: {
    title: 'Ochrana osobních údajů',
    subtitle: 'Podle GDPR (EU) 2016/679',
    s1h: '1. Provozovatel',
    s2h: '2. Jaké údaje zpracováváme',
    s2b: 'Při použití poptávkového formuláře zpracováváme tyto osobní údaje: jméno, telefonní číslo, místo odjezdu a příjezdu, datum a čas cesty, číslo letu (volitelné) a volitelné zprávy.',
    s3h: '3. Účel zpracování',
    s3b: 'Získané údaje zpracováváme výhradně k vyřízení Vaší žádosti o transfer a ke komunikaci s Vámi (například přes WhatsApp).',
    s4h: '4. Právní základ',
    s4b: 'Čl. 6 odst. 1 písm. b GDPR (plnění smlouvy, resp. předsmluvní opatření).',
    s5h: '5. Doba uchovávání',
    s5b: 'Vaše údaje uchováváme pouze po dobu nezbytnou k realizaci transferu, nejdéle však 7 let (zákonná archivační povinnost).',
    s6h: '6. Vaše práva',
    s6b: 'Máte právo na přístup k údajům, jejich opravu, výmaz, omezení zpracování a na přenositelnost údajů. V těchto věcech nás kontaktujte na: info@transfersk.eu',
    s7h: '7. Právo podat stížnost',
    s7b: 'Máte právo podat stížnost dozorovému úřadu — Úřad na ochranu osobních údajů Slovenské republiky (dataprotection.gov.sk).',
  },
  de: {
    title: 'Datenschutzerklärung',
    subtitle: 'Gemäß DSGVO (EU) 2016/679',
    s1h: '1. Verantwortlicher',
    s2h: '2. Welche Daten wir verarbeiten',
    s2b: 'Bei der Nutzung des Anfrageformulars verarbeiten wir folgende personenbezogene Daten: Name, Telefonnummer, Abfahrts- und Ankunftsort, Datum und Uhrzeit der Fahrt, Flugnummer (optional) sowie optionale Nachrichten.',
    s3h: '3. Zweck der Verarbeitung',
    s3b: 'Die erhobenen Daten verarbeiten wir ausschließlich zur Bearbeitung Ihrer Transferanfrage und zur Kommunikation mit Ihnen (zum Beispiel über WhatsApp).',
    s4h: '4. Rechtsgrundlage',
    s4b: 'Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung bzw. vorvertragliche Maßnahmen).',
    s5h: '5. Speicherdauer',
    s5b: 'Ihre Daten speichern wir nur so lange, wie es für die Durchführung des Transfers erforderlich ist, längstens jedoch 7 Jahre (gesetzliche Aufbewahrungspflicht).',
    s6h: '6. Ihre Rechte',
    s6b: 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung sowie Datenübertragbarkeit. Wenden Sie sich hierzu an: info@transfersk.eu',
    s7h: '7. Beschwerderecht',
    s7b: 'Sie haben das Recht, bei einer Aufsichtsbehörde Beschwerde einzureichen — Amt für den Schutz personenbezogener Daten der Slowakischen Republik (dataprotection.gov.sk).',
  },
  en: {
    title: 'Privacy Policy',
    subtitle: 'In accordance with GDPR (EU) 2016/679',
    s1h: '1. Data controller',
    s2h: '2. What data we process',
    s2b: 'When you use the request form, we process the following personal data: name, phone number, place of departure and arrival, date and time of the trip, flight number (optional) and optional messages.',
    s3h: '3. Purpose of processing',
    s3b: 'We process the collected data solely to handle your transfer request and to communicate with you (for example, via WhatsApp).',
    s4h: '4. Legal basis',
    s4b: 'Art. 6(1)(b) GDPR (performance of a contract or pre-contractual measures).',
    s5h: '5. Retention period',
    s5b: 'We keep your data only for as long as necessary to carry out the transfer, but no longer than 7 years (statutory retention obligation).',
    s6h: '6. Your rights',
    s6b: 'You have the right to access, rectification, erasure, restriction of processing and data portability. For these matters, contact us at: info@transfersk.eu',
    s7h: '7. Right to lodge a complaint',
    s7b: 'You have the right to lodge a complaint with a supervisory authority — the Office for Personal Data Protection of the Slovak Republic (dataprotection.gov.sk).',
  },
  ru: {
    title: 'Политика конфиденциальности',
    subtitle: 'В соответствии с GDPR (EU) 2016/679',
    s1h: '1. Оператор данных',
    s2h: '2. Какие данные мы обрабатываем',
    s2b: 'При использовании формы запроса мы обрабатываем следующие персональные данные: имя, номер телефона, место отправления и прибытия, дату и время поездки, номер рейса (по желанию) и необязательные сообщения.',
    s3h: '3. Цель обработки',
    s3b: 'Полученные данные мы обрабатываем исключительно для оформления вашего запроса на трансфер и для связи с вами (например, через WhatsApp).',
    s4h: '4. Правовое основание',
    s4b: 'Ст. 6 п. 1 подп. b GDPR (исполнение договора либо преддоговорные меры).',
    s5h: '5. Срок хранения',
    s5b: 'Ваши данные мы храним только в течение срока, необходимого для выполнения трансфера, но не более 7 лет (установленная законом обязанность хранения).',
    s6h: '6. Ваши права',
    s6b: 'Вы имеете право на доступ к данным, их исправление, удаление, ограничение обработки и на переносимость данных. По этим вопросам обращайтесь: info@transfersk.eu',
    s7h: '7. Право на жалобу',
    s7b: 'Вы имеете право подать жалобу в надзорный орган — Управление по защите персональных данных Словацкой Республики (dataprotection.gov.sk).',
  },
  uk: {
    title: 'Політика конфіденційності',
    subtitle: 'Відповідно до GDPR (EU) 2016/679',
    s1h: '1. Оператор даних',
    s2h: '2. Які дані ми обробляємо',
    s2b: 'Під час використання форми запиту ми обробляємо такі персональні дані: імʼя, номер телефону, місце відправлення та прибуття, дату й час поїздки, номер рейсу (за бажанням) та необовʼязкові повідомлення.',
    s3h: '3. Мета обробки',
    s3b: 'Отримані дані ми обробляємо виключно для оформлення вашого запиту на трансфер і для звʼязку з вами (наприклад, через WhatsApp).',
    s4h: '4. Правова підстава',
    s4b: 'Ст. 6 п. 1 підп. b GDPR (виконання договору або переддоговірні заходи).',
    s5h: '5. Строк зберігання',
    s5b: 'Ваші дані ми зберігаємо лише протягом строку, необхідного для виконання трансферу, але не довше ніж 7 років (встановлений законом обовʼязок зберігання).',
    s6h: '6. Ваші права',
    s6b: 'Ви маєте право на доступ до даних, їх виправлення, видалення, обмеження обробки та на перенесення даних. З цих питань звертайтеся: info@transfersk.eu',
    s7h: '7. Право подати скаргу',
    s7b: 'Ви маєте право подати скаргу до наглядового органу — Управління із захисту персональних даних Словацької Республіки (dataprotection.gov.sk).',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const c = CONTENT[locale] ?? CONTENT.sk;
  return { title: `${c.title} | Transfer SK-EU`, robots: { index: false } };
}

export default async function DatenschutzPage({
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
          <h2>{c.s1h}</h2>
          <p>Vitalii Khilko<br />
          K. Šmidkeho 2938/8, 911 08 Trenčín<br />
          E-mail: info@transfersk.eu</p>
        </section>

        <section className={styles.legal__section}>
          <h2>{c.s2h}</h2>
          <p>{c.s2b}</p>
        </section>

        <section className={styles.legal__section}>
          <h2>{c.s3h}</h2>
          <p>{c.s3b}</p>
        </section>

        <section className={styles.legal__section}>
          <h2>{c.s4h}</h2>
          <p>{c.s4b}</p>
        </section>

        <section className={styles.legal__section}>
          <h2>{c.s5h}</h2>
          <p>{c.s5b}</p>
        </section>

        <section className={styles.legal__section}>
          <h2>{c.s6h}</h2>
          <p>{c.s6b}</p>
        </section>

        <section className={styles.legal__section}>
          <h2>{c.s7h}</h2>
          <p>{c.s7b}</p>
        </section>
      </div>
    </main>
  );
}
