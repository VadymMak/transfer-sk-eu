'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TouchEvent as ReactTouchEvent } from 'react';
import Image from 'next/image';

type GalleryImage = {
  id: string;
  url: string;
  alt: string | null;
};

type Props = {
  images: GalleryImage[];
  tourName: string;
};

export function TripGallery({ images, tourName }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const openedFromIdx = useRef<number | null>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    const from = openedFromIdx.current;
    openedFromIdx.current = null;
    if (from !== null) {
      requestAnimationFrame(() => btnRefs.current[from]?.focus());
    }
  }, []);

  const go = useCallback(
    (dir: 1 | -1) =>
      setOpen(prev => (prev === null ? null : (prev + dir + images.length) % images.length)),
    [images.length],
  );

  const openAt = useCallback((i: number) => {
    openedFromIdx.current = i;
    setOpen(i);
  }, []);

  useEffect(() => {
    if (open === null) return;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => closeRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(-1); }
      if (e.key === 'Escape')     close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, go, close]);

  const onTouchStart = (e: ReactTouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: ReactTouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) go(diff < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <>
      <div className="trip-detail__gallery">
        {images.map((img, i) => (
          <button
            key={img.id}
            ref={el => { btnRefs.current[i] = el; }}
            className="trip-detail__gallery-item trip-gallery-btn"
            onClick={() => openAt(i)}
            aria-label={`Open photo ${i + 1} of ${images.length}${img.alt ? ': ' + img.alt : ''}`}
          >
            <Image
              src={img.url}
              alt={img.alt ?? tourName}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              style={{ objectFit: 'cover' }}
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="trip-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Gallery: ${tourName}`}
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            ref={closeRef}
            className="trip-lightbox__close"
            onClick={close}
            aria-label="Close lightbox"
          >
            ✕
          </button>

          {images.length > 1 && (
            <span className="trip-lightbox__counter" aria-live="polite">
              {open + 1} / {images.length}
            </span>
          )}

          {images.length > 1 && (
            <button
              className="trip-lightbox__arrow trip-lightbox__arrow--prev"
              onClick={e => { e.stopPropagation(); go(-1); }}
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div className="trip-lightbox__img-wrap" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={open}
              src={images[open].url}
              alt={images[open].alt ?? tourName}
              className="trip-lightbox__img"
            />
          </div>

          {images.length > 1 && (
            <button
              className="trip-lightbox__arrow trip-lightbox__arrow--next"
              onClick={e => { e.stopPropagation(); go(1); }}
              aria-label="Next photo"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
