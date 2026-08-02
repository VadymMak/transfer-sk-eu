'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import GoldDivider from '@/components/ui/GoldDivider';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { useQuotePrefill } from '@/stores/useQuotePrefill';
import RouteCombobox, { type ComboRoute } from '@/components/ui/RouteCombobox';

// FROM is always Trenčín for now — all prices are "from Trenčín to ...".
// (Bidirectional/cross pricing to be added once the client confirms.)
const TRENCIN_OPTION: ComboRoute = {
  nameKey: 'Trenčín',
  price: 0,
  nameI18n: { sk: 'Trenčín', cs: 'Trenčín', de: 'Trenčín', en: 'Trenčín', ru: 'Тренчин', uk: 'Тренчин' },
};

interface TransferQuoteSectionProps {
  whatsappNumber?: string;
  routes?: ComboRoute[];
}

export default function TransferQuoteSection({
  whatsappNumber = '',
  routes = [],
}: TransferQuoteSectionProps) {
  const t = useTranslations('transferQuote');
  const locale = useLocale();

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [dropoffRoute, setDropoffRoute] = useState<ComboRoute | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const sectionRef = useRef<HTMLElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const { active, pickup: prefillPickup, dropoff: prefillDropoff, note: prefillNote, clearPrefill } =
    useQuotePrefill();

  useEffect(() => {
    if (!active) return;
    setPickup(prefillPickup);
    setDropoff(prefillDropoff);
    setNote(prefillNote);
    clearPrefill();
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const timer = setTimeout(() => dateInputRef.current?.focus(), 650);
    return () => clearTimeout(timer);
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the "from" field fixed to Trenčín (localized), since all prices are from Trenčín.
  useEffect(() => {
    const trencin = TRENCIN_OPTION.nameI18n?.[locale] ?? 'Trenčín';
    const variants = Object.values(TRENCIN_OPTION.nameI18n ?? {});
    setPickup((prev) => (!prev || variants.includes(prev) ? trencin : prev));
  }, [locale]);

  function handleDropoffChange(label: string, route: ComboRoute | null) {
    setDropoff(label);
    setDropoffRoute(route);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const pickupVal     = pickup.trim();
    const dropoffVal    = dropoff.trim();
    const date          = String(data.get('date')         ?? '').trim();
    const time          = String(data.get('time')         ?? '').trim();
    const passengers    = String(data.get('passengers')   ?? '').trim();
    const luggage       = String(data.get('luggage')      ?? '').trim();
    const flightNumber  = String(data.get('flightNumber') ?? '').trim();
    const name          = String(data.get('name')         ?? '').trim();
    const phone         = String(data.get('phone')        ?? '').trim();
    const noteVal       = note.trim();

    if (!pickupVal || !dropoffVal || !date || !time || !name || !phone) {
      setSubmitError(t('errorRequired'));
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    const fullDropoff = dropoffRoute
      ? (dropoffRoute.nameI18n?.[locale] ?? dropoffRoute.nameKey)
      : dropoffVal;

    try {
      const res = await fetch('/api/transfer-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup: pickupVal, dropoff: fullDropoff, date, time,
          passengers, luggage, flightNumber, name, phone, note: noteVal,
          routeKey: dropoffRoute?.nameKey ?? '',
        }),
      });

      if (!res.ok) {
        setSubmitError(t('errorSave'));
        setSubmitting(false);
        return;
      }

      const lines = [
        `🚗 *${t('waTitle')}*`,
        `━━━━━━━━━━━━━━━━━━`,
        `👤 ${name}  📞 ${phone}`,
        `📍 ${t('waFrom')}: ${pickupVal}`,
        `🏁 ${t('waTo')}: ${fullDropoff}${dropoffRoute ? ` · ${dropoffRoute.price} €` : ''}`,
        `📆 ${date}  🕐 ${time}`,
        `👥 ${passengers}  🧳 ${luggage}`,
        flightNumber ? `✈️ ${t('waFlight')}: ${flightNumber}` : '',
        noteVal ? `💬 ${noteVal}` : '',
        `━━━━━━━━━━━━━━━━━━`,
      ].filter(Boolean).join('\n');

      const waPhone = (whatsappNumber || '').replace(/\D/g, '');
      if (waPhone) {
        window.open(
          `https://wa.me/${waPhone}?text=${encodeURIComponent(lines)}`,
          '_blank',
          'noopener,noreferrer',
        );
      }

      form.reset();
      setPickup('');
      setDropoff('');
      setDropoffRoute(null);
      setNote('');
    } catch {
      setSubmitError(t('errorNetwork'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="angebot" className="booking" ref={sectionRef as React.RefObject<HTMLElement>}>
      <ScrollReveal direction="up" className="section-header">
        <p className="section-label">{t('label')}</p>
        <h2 className="section-title">{t('title')}</h2>
        <GoldDivider />
        <p className="section-subtitle">{t('subtitle')}</p>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={200}>
        <div className="booking__container">
          <form onSubmit={handleSubmit} className="booking__form">

            {/* Row 1: Von | Nach */}
            <div className="booking__form-row">
              <div>
                <label className="booking__label" htmlFor="q-pickup">{t('fieldPickup')}</label>
                <RouteCombobox
                  routes={[TRENCIN_OPTION]}
                  value={pickup}
                  onChange={(label) => setPickup(label)}
                  id="q-pickup"
                  name="pickup"
                  required
                  showPrice={false}
                  placeholder="Trenčín"
                />
              </div>
              <div>
                <label className="booking__label" htmlFor="q-dropoff">{t('fieldDropoff')}</label>
                <RouteCombobox
                  routes={routes}
                  value={dropoff}
                  onChange={handleDropoffChange}
                  id="q-dropoff"
                  name="dropoff"
                  required
                  placeholder="Bratislava Zentrum"
                />
              </div>
            </div>

            {/* Row 2: Datum | Uhrzeit */}
            <div className="booking__form-row">
              <div>
                <label className="booking__label" htmlFor="q-date">{t('fieldDate')}</label>
                <input
                  ref={dateInputRef}
                  type="date"
                  name="date"
                  id="q-date"
                  required
                  className="booking__input"
                />
              </div>
              <div>
                <label className="booking__label" htmlFor="q-time">{t('fieldTime')}</label>
                <input
                  type="time"
                  name="time"
                  id="q-time"
                  required
                  className="booking__input"
                />
              </div>
            </div>

            {/* Row 3: Passagiere | Gepäck */}
            <div className="booking__form-row">
              <div>
                <label className="booking__label" htmlFor="q-passengers">{t('fieldPassengers')}</label>
                <input
                  type="number"
                  name="passengers"
                  id="q-passengers"
                  min={1}
                  max={16}
                  defaultValue={1}
                  required
                  className="booking__input"
                />
              </div>
              <div>
                <label className="booking__label" htmlFor="q-luggage">{t('fieldLuggage')}</label>
                <input
                  type="number"
                  name="luggage"
                  id="q-luggage"
                  min={0}
                  max={20}
                  defaultValue={1}
                  required
                  className="booking__input"
                />
              </div>
            </div>

            {/* Full-width: Flugnummer */}
            <div>
              <label className="booking__label" htmlFor="q-flightNumber">
                {t('fieldFlight')}{' '}
                <span style={{ fontWeight: 400, opacity: 0.65 }}>{t('flightOptional')}</span>
              </label>
              <input
                type="text"
                name="flightNumber"
                id="q-flightNumber"
                className="booking__input"
                placeholder="z.B. OS 123"
              />
            </div>

            {/* Row: Name | Telefon */}
            <div className="booking__form-row">
              <div>
                <label className="booking__label" htmlFor="q-name">{t('fieldName')}</label>
                <input
                  type="text"
                  name="name"
                  id="q-name"
                  required
                  className="booking__input"
                />
              </div>
              <div>
                <label className="booking__label" htmlFor="q-phone">{t('fieldPhone')}</label>
                <input
                  type="tel"
                  name="phone"
                  id="q-phone"
                  required
                  className="booking__input"
                  placeholder="+43 XXX XXX XXXX"
                />
              </div>
            </div>

            {/* Full-width: Nachricht */}
            <div>
              <label className="booking__label" htmlFor="q-note">
                {t('fieldNote')}{' '}
                <span style={{ fontWeight: 400, opacity: 0.65 }}>{t('noteOptional')}</span>
              </label>
              <textarea
                name="note"
                id="q-note"
                className="booking__textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {submitError && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                ⚠️ {submitError}
              </p>
            )}

            <div className="booking__actions">
              <button
                type="submit"
                className="booking__btn-submit booking__btn-full"
                disabled={submitting}
              >
                {submitting ? t('submitting') : t('submit')}
              </button>
            </div>
          </form>

          <p className="booking__note">{t('successNote')}</p>
        </div>
      </ScrollReveal>
    </section>
  );
}
