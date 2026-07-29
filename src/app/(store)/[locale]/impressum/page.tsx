import { setRequestLocale } from 'next-intl/server';
import styles from '../legal.module.css';

export async function generateMetadata() {
  return { title: 'Impressum | Transfer GmbH', robots: { index: false } };
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
        <h1 className={styles.legal__title}>Impressum</h1>
        <p className={styles.legal__subtitle}>Angaben gemäß § 5 DDG</p>

        <section className={styles.legal__section}>
          <h2>Unternehmensangaben</h2>
          <p>Transfer GmbH<br />
          Wiedner Hauptstraße 120<br />
          1050 Wien, Österreich</p>
        </section>

        <section className={styles.legal__section}>
          <h2>Kontakt</h2>
          <p>Telefon: +43 664 000 00 00<br />
          E-Mail: info@transfer-gmbh.at</p>
        </section>

        <section className={styles.legal__section}>
          <h2>Gewerbliche Tätigkeit</h2>
          <p>Gewerblicher Personentransport (Taxi / Mietwagen mit Fahrer)<br />
          Gewerbeberechtigung: Bezirkshauptmannschaft Wien, Österreich</p>
        </section>

        <section className={styles.legal__section}>
          <h2>UID-Nummer</h2>
          <p>ATU00000000 {/* TODO: per client */}</p>
        </section>

        <section className={styles.legal__section}>
          <h2>Haftungsausschluss</h2>
          <p>Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#5A7290' }}>
            {/* TODO: vollständiges Impressum per Mandant via eRecht24.de ergänzen */}
          </p>
        </section>
      </div>
    </main>
  );
}
