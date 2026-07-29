import { getTranslations } from 'next-intl/server';
import type { WhyUsItem } from '@/lib/types';
import GoldDivider from '@/components/ui/GoldDivider';
import ScrollReveal from '@/components/ui/ScrollReveal';

function getIcon(icon: string) {
  switch (icon) {
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'tag':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      );
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'plane':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19.5 2.5 18 1 16 1 14.5 2.5L11 6 2.8 4.2l-1 1 2.4 5L2 14l1 1 5-2.2 5 2.4 1-1z" />
        </svg>
      );
    case 'person':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'car':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <path d="M16 8h4l3 3v5h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    default:
      return null;
  }
}

function WhyUsCard({ item }: { item: WhyUsItem }) {
  return (
    <div className="why-us__card">
      <div className="why-us__icon">{getIcon(item.icon)}</div>
      <h3 className="why-us__card-title">{item.title}</h3>
      <p className="why-us__card-desc">{item.description}</p>
    </div>
  );
}

interface WhyUsSectionProps {
  city?: string;
  googleRating?: number;
  address?: string;
}

export default async function WhyUsSection({ city: _city, googleRating: _googleRating, address: _address }: WhyUsSectionProps) {
  const t = await getTranslations('whyUs');

  const items: WhyUsItem[] = [
    { icon: 'shield', title: t('item1Title'),     description: t('item1Desc') },
    { icon: 'tag',    title: t('item2TitleNoCity'), description: t('item2DescWithoutAddress') },
    { icon: 'clock',  title: t('item3Title'),     description: t('item3Desc') },
    { icon: 'plane',  title: t('item4Title'),     description: t('item4Desc') },
    { icon: 'person', title: t('item5Title'),     description: t('item5Desc') },
    { icon: 'car',    title: t('item6Title'),     description: t('item6Desc') },
  ];

  return (
    <section className="why-us">
      <ScrollReveal direction="up" className="section-header">
        <p className="section-label">{t('sectionLabel')}</p>
        <h2 className="section-title">{t('sectionTitle')}</h2>
        <GoldDivider />
      </ScrollReveal>

      <div className="why-us__grid">
        {items.map((item, i) => (
          <ScrollReveal key={item.icon} direction="up" delay={i * 100}>
            <WhyUsCard item={item} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
