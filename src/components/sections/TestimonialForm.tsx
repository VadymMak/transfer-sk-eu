'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

export default function TestimonialForm() {
  const t = useTranslations('testimonials');
  const locale = useLocale();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');

    await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, city, rating, text, locale, website }),
    });

    setStatus('done');
    setName(''); setCity(''); setRating(5); setText(''); setWebsite('');
  }

  if (status === 'done') {
    return <p className="testimonials__thanks">{t('reviewThanks')}</p>;
  }

  return (
    <form className="testimonials__form review-form" onSubmit={handleSubmit}>
      <div className="testimonials__form-row">
        <input
          className="testimonials__input"
          type="text"
          placeholder={t('reviewName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="testimonials__input"
          type="text"
          placeholder={t('reviewCity')}
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      <fieldset className="testimonials__stars">
        <legend className="testimonials__stars-legend">{t('reviewRating')}</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n}`}
            onClick={() => setRating(n)}
            className={`testimonials__star${n <= rating ? ' testimonials__star--active' : ''}`}
          >
            ★
          </button>
        ))}
      </fieldset>

      <textarea
        className="testimonials__textarea"
        placeholder={t('reviewText')}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        required
      />

      {/* honeypot */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        autoComplete="off"
        tabIndex={-1}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0 }}
      />

      <button
        type="submit"
        className="btn-primary"
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? '…' : t('reviewSubmit')}
      </button>
    </form>
  );
}
