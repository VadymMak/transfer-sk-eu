export const GALLERY_DESTINATIONS = [
  { value: null,            label: 'Главная галерея' },
  { value: 'preprava-veci', label: 'Перевозка вещей' },
  // новые страницы — добавлять сюда
] as const;

export type GalleryTag = (typeof GALLERY_DESTINATIONS)[number]['value'];
