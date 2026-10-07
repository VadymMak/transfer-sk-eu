'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import GoldDivider from '@/components/ui/GoldDivider';
import ScrollReveal from '@/components/ui/ScrollReveal';

interface ServiceMeta {
  nameI18n?: Record<string, string>;
  descI18n?: Record<string, string>;
  priceLabelI18n?: Record<string, string>;
  pageSlug?: string;
}

interface Service {
  id: string;
  nameKey: string;
  description?: string | null;
  price: number;
  duration?: number | null;
  category?: string | null;
  metadata?: ServiceMeta | null;
}

export default function ServicesSection() {
  const t = useTranslations('services');
  const locale = useLocale();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((d: { services?: Service[] }) => {
        setServices(
          (d.services ?? []).filter(
            (s) => s.category !== 'route' && s.category !== 'fleet',
          ),
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section id="leistungen" className="services">
      <ScrollReveal direction="up" className="section-header">
        <p className="section-label">{t('title')}</p>
        <h2 className="section-title">{t('subtitle')}</h2>
        <GoldDivider />
        <p className="section-subtitle">{t('description')}</p>
      </ScrollReveal>

      <div className="services__grid">
        {loading
          ? [0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="service-card service-card--skeleton" />
            ))
          : services.map((s, i) => {
              const pageSlug = s.metadata?.pageSlug;
              const cardContent = (
                <div className={`service-card${pageSlug ? ' service-card--link' : ''}`}>
                  <div>
                    <h3 className="service-card__name">
                      {s.metadata?.nameI18n?.[locale] ?? s.nameKey}
                    </h3>
                    {(s.metadata?.descI18n?.[locale] ?? s.description) && (
                      <p className="service-card__desc">
                        {s.metadata?.descI18n?.[locale] ?? s.description}
                      </p>
                    )}
                    {!!s.duration && !s.metadata?.priceLabelI18n && (
                      <p className="service-card__duration">⏱ {s.duration} {t('minutes')}</p>
                    )}
                  </div>
                  <div className="service-card__price">
                    {s.metadata?.priceLabelI18n?.[locale] ?? `€${s.price}`}
                  </div>
                </div>
              );
              return (
                <ScrollReveal key={s.id} direction="scale" delay={i * 100}>
                  {pageSlug ? (
                    <Link href={`/${locale}${pageSlug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                      {cardContent}
                    </Link>
                  ) : cardContent}
                </ScrollReveal>
              );
            })}
      </div>
    </section>
  );
}
