'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import GoldDivider from '@/components/ui/GoldDivider';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { useQuotePrefill } from '@/stores/useQuotePrefill';

interface TransferQuoteSectionProps {
  whatsappNumber?: string;
}

export default function TransferQuoteSection({
  whatsappNumber = '436640000000',
}: TransferQuoteSectionProps) {
  const t = useTranslations('transferQuote');

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
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

    try {
      const res = await fetch('/api/transfer-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup: pickupVal, dropoff: dropoffVal, date, time,
          passengers, luggage, flightNumber, name, phone, note: noteVal,
        }),
      });

      if (!res.ok) {
        setSubmitError(t('errorSave'));
        setSubmitting(false);
        return;
      }

      const lines = [
        `🚗 *Transferanfrage — Transfer GmbH*`,
        `━━━━━━━━━━━━━━━━━━`,
        `👤 ${name}  📞 ${phone}`,
        `📍 Von: ${pickupVal}`,
        `🏁 Nach: ${dropoffVal}`,
        `📆 ${date}  🕐 ${time}`,
        `👥 ${passengers} Person(en)  🧳 ${luggage} Koffer`,
        flightNumber ? `✈️ Flugnummer: ${flightNumber}` : '',
        noteVal ? `💬 ${noteVal}` : '',
        `━━━━━━━━━━━━━━━━━━`,
      ].filter(Boolean).join('\n');

      const waPhone = whatsappNumber ?? '436640000000';
      window.open(
        `https://wa.me/${waPhone}?text=${encodeURIComponent(lines)}`,
        '_blank',
        'noopener,noreferrer',
      );

      form.reset();
      setPickup('');
      setDropoff('');
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
                <label className="booking__label">{t('fieldPickup')}</label>
                <input
                  type="text"
                  name="pickup"
                  required
                  className="booking__input"
                  placeholder="Wien Flughafen"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                />
              </div>
              <div>
                <label className="booking__label">{t('fieldDropoff')}</label>
                <input
                  type="text"
                  name="dropoff"
                  required
                  className="booking__input"
                  placeholder="Bratislava Zentrum"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Datum | Uhrzeit */}
            <div className="booking__form-row">
              <div>
                <label className="booking__label">{t('fieldDate')}</label>
                <input
                  ref={dateInputRef}
                  type="date"
                  name="date"
                  required
                  className="booking__input"
                />
              </div>
              <div>
                <label className="booking__label">{t('fieldTime')}</label>
                <input
                  type="time"
                  name="time"
                  required
                  className="booking__input"
                />
              </div>
            </div>

            {/* Row 3: Passagiere | Gepäck */}
            <div className="booking__form-row">
              <div>
                <label className="booking__label">{t('fieldPassengers')}</label>
                <input
                  type="number"
                  name="passengers"
                  min={1}
                  max={16}
                  defaultValue={1}
                  required
                  className="booking__input"
                />
              </div>
              <div>
                <label className="booking__label">{t('fieldLuggage')}</label>
                <input
                  type="number"
                  name="luggage"
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
              <label className="booking__label">
                {t('fieldFlight')}{' '}
                <span style={{ fontWeight: 400, opacity: 0.65 }}>{t('flightOptional')}</span>
              </label>
              <input
                type="text"
                name="flightNumber"
                className="booking__input"
                placeholder="z.B. OS 123"
              />
            </div>

            {/* Row: Name | Telefon */}
            <div className="booking__form-row">
              <div>
                <label className="booking__label">{t('fieldName')}</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="booking__input"
                />
              </div>
              <div>
                <label className="booking__label">{t('fieldPhone')}</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="booking__input"
                  placeholder="+43 XXX XXX XXXX"
                />
              </div>
            </div>

            {/* Full-width: Nachricht */}
            <div>
              <label className="booking__label">
                {t('fieldNote')}{' '}
                <span style={{ fontWeight: 400, opacity: 0.65 }}>{t('noteOptional')}</span>
              </label>
              <textarea
                name="note"
                className="booking__textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {submitError && (
              <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
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
