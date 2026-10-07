import Image from 'next/image';
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import styles from './PageGallery.module.css';

const LABELS: Record<string, { title: string; subtitle: string }> = {
  sk: { title: 'Naše reálne prepravy', subtitle: 'Skutočné fotky naložených vozidiel z našich jázd.' },
  de: { title: 'Unsere echten Transporte', subtitle: 'Echte Fotos beladener Fahrzeuge aus unseren Fahrten.' },
  cs: { title: 'Naše skutečné přepravy', subtitle: 'Skutečné fotky naložených vozidel z našich jízd.' },
  en: { title: 'Our real deliveries', subtitle: 'Real photos of loaded vehicles from our trips.' },
  ru: { title: 'Наши реальные перевозки', subtitle: 'Настоящие фото загруженных машин из наших поездок.' },
  uk: { title: 'Наші реальні перевезення', subtitle: 'Справжні фото завантажених авто з наших поїздок.' },
};

interface Props {
  tag: string;
  locale: string;
  storeSlug: string;
}

const getGalleryImages = unstable_cache(
  async (storeSlug: string, tag: string) => {
    const store = await db.store.findUnique({ where: { slug: storeSlug }, select: { id: true } });
    if (!store) return [];
    return db.galleryImage.findMany({
      where: { storeId: store.id, tag, active: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, url: true, alt: true },
    });
  },
  ['page-gallery'],
  { tags: ['gallery'], revalidate: 3600 },
);

export default async function PageGallery({ tag, locale, storeSlug }: Props) {
  const images = await getGalleryImages(storeSlug, tag);

  if (images.length === 0) return null;

  const labels = LABELS[locale] ?? LABELS.sk;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{labels.title}</h2>
      <p className={styles.subtitle}>{labels.subtitle}</p>
      <div className={styles.grid}>
        {images.map((img) => (
          <div key={img.id} className={styles.item}>
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={styles.img}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
