'use client';

const CTA: Record<string, { text: string; ask: string }> = {
  de: { text: 'Antwort nicht gefunden?', ask: 'KI-Assistent fragen' },
  sk: { text: 'Nenašli ste odpoveď?', ask: 'Spýtať sa asistenta' },
  cs: { text: 'Nenašli jste odpověď?', ask: 'Zeptat se asistenta' },
  en: { text: "Didn't find your answer?", ask: 'Ask our assistant' },
  ru: { text: 'Не нашли ответ?', ask: 'Спросить ассистента' },
  uk: { text: 'Не знайшли відповідь?', ask: 'Запитати асистента' },
};

export default function FaqCta({ locale, whatsappHref }: { locale: string; whatsappHref?: string }) {
  const t = CTA[locale] ?? CTA.en;
  return (
    <div style={{ textAlign: 'center', marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <p style={{ opacity: 0.85, margin: 0 }}>{t.text}</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button type="button" className="btn-primary" onClick={() => window.dispatchEvent(new Event('open-chat'))}>
          {t.ask}
        </button>
        {whatsappHref && whatsappHref !== '#' && (
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">WhatsApp</a>
        )}
      </div>
    </div>
  );
}
