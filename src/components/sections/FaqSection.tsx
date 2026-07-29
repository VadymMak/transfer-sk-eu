// src/components/sections/FaqSection.tsx
// Серверный компонент: видимый FAQ (native <details> accordion) + FAQPage JSON-LD.
// Контент захардкожен по локалям, чтобы файл был самодостаточным. При желании
// позже вынести в i18n messages. Стили — нейтральные inline, подстраиваются под тему.

type QA = { q: string; a: string };

const TITLES: Record<string, string> = {
  de: 'Häufige Fragen',
  sk: 'Časté otázky',
  cs: 'Časté dotazy',
  en: 'FAQ',
};

const FAQ: Record<string, QA[]> = {
  de: [
    { q: 'Wie buche ich einen Transfer?', a: 'Senden Sie eine Anfrage über das Formular oder per WhatsApp – wir bestätigen Preis und Abholzeit innerhalb kurzer Zeit.' },
    { q: 'Was kostet ein Transfer Wien ⇄ Bratislava?', a: 'Wir arbeiten mit Festpreisen ohne versteckte Gebühren. Den genauen Preis erhalten Sie sofort auf Anfrage.' },
    { q: 'Welche Zahlungsarten akzeptieren Sie?', a: 'Barzahlung und Kreditkarte (EUR).' },
    { q: 'Wie viel Gepäck kann ich mitnehmen?', a: 'Standardgepäck pro Person ist inklusive. Für Sondergepäck (Ski, Fahrrad) informieren Sie uns bitte bei der Anfrage.' },
    { q: 'Gibt es Kindersitze?', a: 'Ja, Kindersitze sind auf Anfrage kostenlos verfügbar – bitte bei der Buchung angeben.' },
    { q: 'Sind Sie rund um die Uhr verfügbar?', a: 'Ja, wir fahren 24/7 – auch für frühe Flüge und Nachtankünfte.' },
  ],
  sk: [
    { q: 'Ako si objednám transfer?', a: 'Pošlite dopyt cez formulár alebo WhatsApp – čo najskôr potvrdíme cenu a čas vyzdvihnutia.' },
    { q: 'Koľko stojí transfer Viedeň ⇄ Bratislava?', a: 'Pracujeme s pevnými cenami bez skrytých poplatkov. Presnú cenu dostanete ihneď na dopyt.' },
    { q: 'Aké spôsoby platby akceptujete?', a: 'Hotovosť a platobná karta (EUR).' },
    { q: 'Koľko batožiny si môžem vziať?', a: 'Štandardná batožina na osobu je v cene. Pri nadrozmernej (lyže, bicykel) nás informujte v dopyte.' },
    { q: 'Sú k dispozícii detské sedačky?', a: 'Áno, detské sedačky sú na požiadanie zdarma – uveďte ich pri objednávke.' },
    { q: 'Ste dostupní nonstop?', a: 'Áno, jazdíme 24/7 – aj skoré lety a nočné prílety.' },
  ],
  cs: [
    { q: 'Jak si objednám transfer?', a: 'Pošlete poptávku přes formulář nebo WhatsApp – co nejdříve potvrdíme cenu a čas vyzvednutí.' },
    { q: 'Kolik stojí transfer Vídeň ⇄ Bratislava?', a: 'Pracujeme s pevnými cenami bez skrytých poplatků. Přesnou cenu dostanete ihned na poptávku.' },
    { q: 'Jaké způsoby platby přijímáte?', a: 'Hotovost a platební karta (EUR).' },
    { q: 'Kolik zavazadel si mohu vzít?', a: 'Standardní zavazadlo na osobu je v ceně. U nadměrných (lyže, kolo) nás informujte v poptávce.' },
    { q: 'Jsou k dispozici dětské sedačky?', a: 'Ano, dětské sedačky jsou na vyžádání zdarma – uveďte je při objednávce.' },
    { q: 'Jste dostupní nonstop?', a: 'Ano, jezdíme 24/7 – i brzké lety a noční přílety.' },
  ],
  en: [
    { q: 'How do I book a transfer?', a: 'Send a request via the form or WhatsApp – we confirm the price and pickup time shortly.' },
    { q: 'How much is a Vienna ⇄ Bratislava transfer?', a: 'We work with fixed prices, no hidden fees. You get the exact price instantly on request.' },
    { q: 'What payment methods do you accept?', a: 'Cash and credit card (EUR).' },
    { q: 'How much luggage can I bring?', a: 'Standard luggage per person is included. For oversized items (skis, bike), let us know in the request.' },
    { q: 'Are child seats available?', a: 'Yes, child seats are available free of charge on request – please mention it when booking.' },
    { q: 'Are you available 24/7?', a: 'Yes, we drive 24/7 – including early flights and night arrivals.' },
  ],
};

export default function FaqSection({ locale }: { locale: string }) {
  const items = FAQ[locale] ?? FAQ.en;
  const title = TITLES[locale] ?? TITLES.en;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };

  return (
    <section aria-labelledby="faq-heading" style={{ padding: '48px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h2 id="faq-heading" style={{ textAlign: 'center', marginBottom: 24 }}>
          {title}
        </h2>
        <div>
          {items.map((it, i) => (
            <details
              key={i}
              style={{ borderBottom: '1px solid rgba(0,0,0,0.12)', padding: '14px 0' }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 600, listStyle: 'none' }}>
                {it.q}
              </summary>
              <p style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.6 }}>{it.a}</p>
            </details>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
