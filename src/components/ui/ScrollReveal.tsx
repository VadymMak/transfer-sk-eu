'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type Direction = 'up' | 'left' | 'right' | 'scale';

const CLASS: Record<Direction, string> = {
  up:    'reveal',
  left:  'reveal-left',
  right: 'reveal-right',
  scale: 'reveal-scale',
};

interface Props {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
}

export default function ScrollReveal({ children, direction = 'up', delay = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => setTimeout(() => el.classList.add('is-visible'), delay);

    if (el.getBoundingClientRect().top < window.innerHeight) {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          observer.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`${CLASS[direction]}${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}
