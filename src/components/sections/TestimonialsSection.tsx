import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import TestimonialCard from '@/components/ui/TestimonialCard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import GoldDivider from '@/components/ui/GoldDivider';
import TestimonialForm from './TestimonialForm';

export interface TestimonialItem {
  id: string;
  name: string;
  content: string;
  rating: number;
  createdAt: string;
  adminReply?: string | null;
  adminReplyAt?: string | null;
}

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
  locale: string;
}

export default async function TestimonialsSection({ testimonials, locale }: TestimonialsSectionProps) {
  const t = await getTranslations('testimonials');

  return (
    <section id="bewertungen" className="testimonials">
      <ScrollReveal direction="up" className="section-header">
        <p className="section-label">{t('sectionLabel')}</p>
        <h2 className="section-title">{t('sectionTitle')}</h2>
        <GoldDivider />
      </ScrollReveal>

      {testimonials.length === 0 ? (
        <p className="testimonials__empty">{t('reviewsEmpty')}</p>
      ) : (
        <>
          <div className="testimonials__grid">
            {testimonials.map((item, i) => (
              <ScrollReveal key={item.id} direction="up" delay={i * 120}>
                <TestimonialCard
                  name={item.name}
                  content={item.content}
                  rating={item.rating}
                  createdAt={item.createdAt}
                  adminReply={item.adminReply}
                  adminReplyAt={item.adminReplyAt}
                />
              </ScrollReveal>
            ))}
          </div>
          <div className="testimonials__viewall">
            <Link href={`/${locale}/reviews`} className="btn-outline">
              {t('viewAllReviews')} →
            </Link>
          </div>
        </>
      )}

      <div className="testimonials__add">
        <h3 className="testimonials__add-title">{t('addReview')}</h3>
        <TestimonialForm />
      </div>
    </section>
  );
}
