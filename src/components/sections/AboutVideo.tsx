'use client';

import { useEffect, useRef } from 'react';

export default function AboutVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className="about__video"
      muted
      loop
      playsInline
      preload="metadata"
      poster="/media/about-poster.jpg"
      aria-hidden="true"
    >
      <source src="/media/about.webm" type="video/webm" />
      <source src="/media/about.mp4"  type="video/mp4" />
    </video>
  );
}
