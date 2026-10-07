'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './settings.module.css';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';
import { GALLERY_DESTINATIONS, type GalleryTag } from '@/lib/galleryDestinations';

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  tag: string | null;
  sortOrder: number;
  active: boolean;
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', 'gallery');
  const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string; details?: string };
    throw new Error(err.details ?? err.error ?? 'Upload failed');
  }
  const { url } = (await res.json()) as { url: string };
  return url;
}

export default function GalleryTab() {
  const { locale } = useAdminLocale();
  const t = getAdminT(locale);
  const g = t.gallery;

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cardFileRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/gallery');
      const data = (await res.json()) as { images?: GalleryImage[] };
      setImages(data.images ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchImages(); }, [fetchImages]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading('new');
    try {
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, alt: file.name.replace(/\.[^.]+$/, '') }),
        });
      }
      await fetchImages();
    } catch (err) {
      alert(err instanceof Error ? err.message : g.uploadError);
    } finally {
      setUploading(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleCardReplace = async (e: React.ChangeEvent<HTMLInputElement>, imageId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(imageId);
    try {
      const url = await uploadFile(file);
      await fetch('/api/admin/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: imageId, url }),
      });
      setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, url } : img)));
    } catch (err) {
      alert(err instanceof Error ? err.message : g.uploadError);
    } finally {
      setUploading(null);
      const input = cardFileRefs.current.get(imageId);
      if (input) input.value = '';
    }
  };

  const toggleActive = async (img: GalleryImage) => {
    await fetch('/api/admin/gallery', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: img.id, active: !img.active }),
    });
    setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, active: !img.active } : i)));
  };

  const deleteImage = async (img: GalleryImage) => {
    if (!confirm(g.deleteConfirm)) return;
    await fetch(`/api/admin/gallery?id=${img.id}`, { method: 'DELETE' });
    setImages((prev) => prev.filter((i) => i.id !== img.id));
  };

  const updateTag = async (img: GalleryImage, tag: GalleryTag) => {
    setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, tag } : i)));
    await fetch('/api/admin/gallery', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: img.id, tag }),
    });
  };

  if (loading) return <p style={{ color: '#888', fontSize: 14 }}>{t.common.loading}</p>;

  const knownValues = GALLERY_DESTINATIONS.map((d) => d.value);
  const groups = GALLERY_DESTINATIONS.map((dest) => ({
    dest,
    items: images.filter((img) => img.tag === dest.value),
  })).filter((g) => g.items.length > 0);
  const ungrouped = images.filter((img) => !knownValues.includes(img.tag as GalleryTag));

  const allGroups = [
    ...groups,
    ...(ungrouped.length > 0 ? [{ dest: { value: '__other__' as GalleryTag, label: 'Без назначения' }, items: ungrouped }] : []),
  ];

  return (
    <>
      <div className={styles.galleryToolbar}>
        <label className={styles.uploadLabel}>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} />
          {uploading === 'new' ? g.uploading : g.addPhoto}
        </label>
        <span style={{ fontSize: 13, color: '#888' }}>{g.photoCount.replace('{count}', String(images.length))}</span>
      </div>

      {images.length === 0 ? (
        <p style={{ color: '#888', fontSize: 14 }}>{g.empty}</p>
      ) : (
        allGroups.map(({ dest, items }) => (
          <div key={String(dest.value)} className={styles.galleryGroup}>
            <h3 className={styles.galleryGroupTitle}>
              {dest.label}
              <span className={styles.galleryGroupCount}> ({items.length})</span>
            </h3>
            <div className={styles.galleryGrid}>
              {items.map((img) => (
                <div key={img.id} className={`${styles.galleryCard} ${!img.active ? styles.galleryCardInactive : ''}`}>
                  <div className={styles.galleryImageWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt} />
                    <span className={styles.galleryBadge}>
                      {GALLERY_DESTINATIONS.find((d) => d.value === img.tag)?.label ?? img.tag ?? '—'}
                    </span>
                  </div>
                  <div className={styles.galleryCardActions}>
                    <label
                      className={`${styles.cardBtn} ${styles.cardBtnOutline}`}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      title={g.replace}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        ref={(el) => { if (el) cardFileRefs.current.set(img.id, el); else cardFileRefs.current.delete(img.id); }}
                        onChange={(e) => handleCardReplace(e, img.id)}
                        disabled={uploading === img.id}
                      />
                      {uploading === img.id ? '...' : '↑ Foto'}
                    </label>
                    <button
                      type="button"
                      className={`${styles.cardBtn} ${styles.cardBtnOutline}`}
                      onClick={() => void toggleActive(img)}
                    >
                      {img.active ? g.hidePhoto : g.showPhoto}
                    </button>
                    <button
                      type="button"
                      className={`${styles.cardBtn} ${styles.cardBtnDanger}`}
                      onClick={() => void deleteImage(img)}
                    >
                      ×
                    </button>
                  </div>
                  <div className={styles.galleryDestRow}>
                    <span className={styles.galleryDestLabel}>{g.destinationLabel}</span>
                    <select
                      className={styles.galleryDestSelect}
                      value={img.tag ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : e.target.value;
                        void updateTag(img, val as GalleryTag);
                      }}
                    >
                      {GALLERY_DESTINATIONS.map((d) => (
                        <option key={String(d.value)} value={d.value ?? ''}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}
