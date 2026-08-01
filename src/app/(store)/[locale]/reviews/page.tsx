import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { getStoreConfig } from '@/lib/store-config';
import TestimonialCard from '@/components/ui/TestimonialCard';
import TestimonialForm from '@/components/sections/TestimonialForm';
import GoldDivider from '@/components/ui/GoldDivider';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const config = await getStoreConfig();
  const t = await getTranslations({ locale, namespace: 'testimonials' });
  return { title: `${t('pageTitle')} — ${config.name}` };
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [config, t] = await Promise.all([
    getStoreConfig(),
    getTranslations('testimonials'),
  ]);

  const reviews = await db.testimonial.findMany({
    where: { storeId: config.id, status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    include: { customer: { select: { name: true } } },
  });

  const items = reviews.map((r) => ({
    id: r.id,
    name: r.authorName ?? r.customer?.name ?? 'Klient',
    content: r.text,
    rating: r.rating,
    createdAt: r.createdAt.toISOString(),
    adminReply: r.adminReply,
    adminReplyAt: r.adminReplyAt?.toISOString() ?? null,
  }));

  return (
    <main className="reviews-page">
      <div className="reviews-page__inner">
        <Link href={`/${locale}`} className="reviews-page__back">
          ← {t('back')}
        </Link>

        <div className="section-header" style={{ marginBottom: '3rem' }}>
          <p className="section-label">{t('sectionLabel')}</p>
          <h1 className="section-title">{t('pageTitle')}</h1>
          <GoldDivider />
        </div>

        {items.length === 0 ? (
          <p className="testimonials__empty">{t('reviewsEmpty')}</p>
        ) : (
          <div className="reviews-page__grid">
            {items.map((item) => (
              <TestimonialCard
                key={item.id}
                name={item.name}
                content={item.content}
                rating={item.rating}
                createdAt={item.createdAt}
                adminReply={item.adminReply}
                adminReplyAt={item.adminReplyAt}
              />
            ))}
          </div>
        )}

        <div className="testimonials__add" style={{ marginTop: '4rem' }}>
          <h2 className="testimonials__add-title">{t('addReview')}</h2>
          <TestimonialForm />
        </div>
      </div>
    </main>
  );
}
