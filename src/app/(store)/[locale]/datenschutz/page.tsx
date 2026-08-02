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

export async function generateMetadata() {
  return { title: 'Ochrana osobných údajov | Transfer SK-EU', robots: { index: false } };
}

export default async function DatenschutzPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className={styles.legal}>
      <div className={styles.legal__inner}>
        <Link href={`/${locale}`} className={styles.legal__back}>{BACK[locale] ?? BACK.sk}</Link>
        <h1 className={styles.legal__title}>Ochrana osobných údajov</h1>
        <p className={styles.legal__subtitle}>Podľa GDPR (EU) 2016/679</p>

        <section className={styles.legal__section}>
          <h2>1. Prevádzkovateľ</h2>
          <p>Vitalii Khilko<br />
          K. Šmidkeho 2938/8, 911 08 Trenčín<br />
          E-mail: info@transfersk.eu</p>
        </section>

        <section className={styles.legal__section}>
          <h2>2. Aké údaje spracúvame</h2>
          <p>Pri použití dopytového formulára spracúvame tieto osobné údaje: meno, telefónne číslo, miesto odchodu a príchodu, dátum a čas cesty, číslo letu (voliteľné) a voliteľné správy.</p>
        </section>

        <section className={styles.legal__section}>
          <h2>3. Účel spracúvania</h2>
          <p>Získané údaje spracúvame výlučne na vybavenie Vašej žiadosti o transfer a na komunikáciu s Vami (napríklad cez WhatsApp).</p>
        </section>

        <section className={styles.legal__section}>
          <h2>4. Právny základ</h2>
          <p>Čl. 6 ods. 1 písm. b GDPR (plnenie zmluvy, resp. predzmluvné opatrenia).</p>
        </section>

        <section className={styles.legal__section}>
          <h2>5. Doba uchovávania</h2>
          <p>Vaše údaje uchovávame len po dobu nevyhnutnú na realizáciu transferu, najdlhšie však 7 rokov (zákonná archivačná povinnosť).</p>
        </section>

        <section className={styles.legal__section}>
          <h2>6. Vaše práva</h2>
          <p>Máte právo na prístup k údajom, ich opravu, vymazanie, obmedzenie spracúvania a na prenosnosť údajov. V týchto veciach nás kontaktujte na: info@transfersk.eu</p>
        </section>

        <section className={styles.legal__section}>
          <h2>7. Právo podať sťažnosť</h2>
          <p>Máte právo podať sťažnosť dozornému orgánu — Úrad na ochranu osobných údajov Slovenskej republiky (dataprotection.gov.sk).</p>
        </section>
      </div>
    </main>
  );
}
