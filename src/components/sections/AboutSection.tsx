import { getTranslations } from 'next-intl/server';
import ScrollReveal from '@/components/ui/ScrollReveal';
import GoldDivider from '@/components/ui/GoldDivider';
import AboutVideo from './AboutVideo';

interface AboutSectionProps {
  aboutImage?: string | null;
}

export default async function AboutSection(_: AboutSectionProps) {
  const t = await getTranslations('about');

  return (
    <section id="ueber-uns" className="about">
      <div className="about__inner">
        <AboutVideo />
        <div className="about__overlay" />
        <div className="about__grid">
          <div className="about__spacer" aria-hidden="true" />
          <ScrollReveal direction="right" delay={150}>
            <div>
              <p className="about__label">{t('label')}</p>
              <h2 className="about__title">{t('title')}</h2>
              <GoldDivider />
              <p className="about__text">{t('text1')}</p>
              <p className="about__text">{t('text2')}</p>
              <p className="about__text">{t('text3')}</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
