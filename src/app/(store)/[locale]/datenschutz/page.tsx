import { setRequestLocale } from 'next-intl/server';
import styles from '../legal.module.css';

export async function generateMetadata() {
  return { title: 'Datenschutzerklärung | Transfer GmbH', robots: { index: false } };
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
        <h1 className={styles.legal__title}>Datenschutzerklärung</h1>
        <p className={styles.legal__subtitle}>Gemäß DSGVO (EU) 2016/679</p>

        <section className={styles.legal__section}>
          <h2>1. Verantwortlicher</h2>
          <p>Transfer GmbH<br />
          Wiedner Hauptstraße 120, 1050 Wien<br />
          E-Mail: info@transfer-gmbh.at</p>
        </section>

        <section className={styles.legal__section}>
          <h2>2. Erhobene Daten</h2>
          <p>Bei der Nutzung des Anfrageformulars erheben wir folgende personenbezogene Daten: Name, Telefonnummer, Abfahrts- und Ankunftsort, Reisedatum und -uhrzeit, Flugnummer (optional) sowie optionale Nachrichten.</p>
        </section>

        <section className={styles.legal__section}>
          <h2>3. Zweck der Verarbeitung</h2>
          <p>Die erhobenen Daten werden ausschließlich zur Bearbeitung Ihrer Transferanfrage und zur Kommunikation über WhatsApp verwendet.</p>
        </section>

        <section className={styles.legal__section}>
          <h2>4. Rechtsgrundlage</h2>
          <p>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung bzw. vorvertragliche Maßnahmen).</p>
        </section>

        <section className={styles.legal__section}>
          <h2>5. Speicherdauer</h2>
          <p>Ihre Daten werden nur so lange gespeichert, wie es für die Durchführung des Transfers erforderlich ist, längstens jedoch 7 Jahre (gesetzliche Aufbewahrungspflicht).</p>
        </section>

        <section className={styles.legal__section}>
          <h2>6. Ihre Rechte</h2>
          <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung sowie Datenübertragbarkeit. Wenden Sie sich hierzu an: info@transfer-gmbh.at</p>
        </section>

        <section className={styles.legal__section}>
          <h2>7. Beschwerderecht</h2>
          <p>Sie haben das Recht, bei einer Aufsichtsbehörde Beschwerde einzureichen. In Österreich: Datenschutzbehörde (dsb.gv.at).</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#5A7290' }}>
            {/* TODO: vollständige Datenschutzerklärung per Mandant via eRecht24.de ergänzen */}
          </p>
        </section>
      </div>
    </main>
  );
}
