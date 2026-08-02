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
  return { title: 'Impressum | Transfer SK-EU', robots: { index: false } };
}

export default async function ImpressumPage({
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
        <h1 className={styles.legal__title}>Impressum</h1>
        <p className={styles.legal__subtitle}>Informácie o prevádzkovateľovi</p>

        <section className={styles.legal__section}>
          <h2>Prevádzkovateľ</h2>
          <p>Vitalii Khilko<br />
          K. Šmidkeho 2938/8<br />
          911 08 Trenčín, Slovensko</p>
        </section>

        <section className={styles.legal__section}>
          <h2>Kontakt</h2>
          <p>Telefón: +421 951 287 892<br />
          E-mail: info@transfersk.eu</p>
        </section>

        <section className={styles.legal__section}>
          <h2>Identifikačné údaje</h2>
          <p>IČO: 57093865<br />
          DIČ: 3120653360<br />
          Neplatca DPH</p>
        </section>

        <section className={styles.legal__section}>
          <h2>Predmet podnikania</h2>
          <p>Osobná cestná doprava — taxislužba / prenájom vozidla s vodičom.<br />
          Preukaz vodiča vozidla taxislužby č. T45487, vydaný dňa 11. 07. 2025,
          Okresný úrad Trenčín, odbor cestnej dopravy a pozemných komunikácií.</p>
        </section>

        <section className={styles.legal__section}>
          <h2>Vylúčenie zodpovednosti</h2>
          <p>Napriek starostlivej kontrole obsahu nepreberáme zodpovednosť za obsah externých odkazov. Za obsah odkazovaných stránok zodpovedajú výlučne ich prevádzkovatelia.</p>
        </section>
      </div>
    </main>
  );
}
