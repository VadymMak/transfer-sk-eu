'use client';

import { useState } from 'react';

export const BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADklEQVR42mOQQgIMODkAR3MDqczGPFgAAAAASUVORK5CYII=';

interface BlurImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  wrapperStyle?: React.CSSProperties;
  wrapperClassName?: string;
}

export default function BlurImage({
  src,
  alt,
  className,
  style,
  wrapperStyle,
  wrapperClassName,
}: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={wrapperClassName}
      style={{ position: 'relative', overflow: 'hidden', ...wrapperStyle }}
    >
      {/* Blur placeholder — disappears after load */}
      <img
        src={BLUR_PLACEHOLDER}
        aria-hidden="true"
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(12px)',
          transform: 'scale(1.05)',
          transition: 'opacity 0.4s ease',
          opacity: loaded ? 0 : 1,
          pointerEvents: 'none',
        }}
      />
      {/* Real image — fades in */}
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          ...style,
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'opacity 0.5s ease',
          opacity: loaded ? 1 : 0,
        }}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
    </div>
  );
}
