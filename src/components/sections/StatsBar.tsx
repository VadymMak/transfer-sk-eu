import { getTranslations } from 'next-intl/server';
import ScrollReveal from '@/components/ui/ScrollReveal';

interface StatItem { number: string; label: string; }

export default async function StatsBar() {
  const t = await getTranslations('stats');

  const stats: StatItem[] = [
    { number: '24/7', label: t('availLabel')     },
    { number: '4',    label: t('airportsLabel')  },
    { number: '8',    label: t('seatsLabel')     },
    { number: '5',    label: t('languagesLabel') },
  ];

  return (
    <ScrollReveal direction="up">
      <div className="stats-bar">
        <div className="stats-bar__grid">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="stats-bar__number">{stat.number}</div>
              <div className="stats-bar__label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
