import { getTranslations, getLocale } from 'next-intl/server';
import GoldDivider from '@/components/ui/GoldDivider';
import ScrollReveal from '@/components/ui/ScrollReveal';
import RouteCard from './RouteCard';

interface Route {
  id: string;
  nameKey: string;
  metadata?: unknown;
  displayName: string;
  price: number;
  description: string | null;
  featured: boolean;
}

interface RoutesSectionProps {
  routes: Route[];
}

export default async function RoutesSection({ routes }: RoutesSectionProps) {
  const [t, locale] = await Promise.all([getTranslations('routes'), getLocale()]);

  const localizedRoutes = routes.map(route => {
    const meta = route.metadata as { nameI18n?: Record<string, string> } | null;
    return { ...route, name: meta?.nameI18n?.[locale] ?? route.displayName };
  });

  return (
    <section id="strecken" className="services">
      <ScrollReveal direction="up" className="section-header">
        <p className="section-label">{t('label')}</p>
        <h2 className="section-title">{t('title')}</h2>
        <GoldDivider />
        <p className="section-subtitle">{t('subtitle')}</p>
      </ScrollReveal>

      <div className="services__grid">
        {localizedRoutes.map((route, i) => (
          <ScrollReveal key={route.id} direction="scale" delay={i * 80}>
            <RouteCard
              id={route.id}
              displayName={route.name}
              price={route.price}
              description={route.description}
              featured={route.featured}
              priceLabel={t('priceLabel')}
              vehicleCaption={t('vehicleCaption')}
              featuredLabel={t('featuredLabel')}
              ctaHint={t('ctaHint')}
              routeLabel={t('routeLabel')}
            />
          </ScrollReveal>
        ))}
      </div>

      <p className="booking__note">{t('note')}</p>
    </section>
  );
}
