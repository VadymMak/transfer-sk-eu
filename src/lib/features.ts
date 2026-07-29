export const features = {
  booking: process.env.NEXT_PUBLIC_ENABLE_BOOKING === 'true',
  whatsappBooking: process.env.NEXT_PUBLIC_ENABLE_WHATSAPP_BOOKING !== 'false',
  payment: process.env.NEXT_PUBLIC_ENABLE_PAYMENT === 'true',
  deposit: process.env.NEXT_PUBLIC_ENABLE_DEPOSIT === 'true',
  sms: process.env.NEXT_PUBLIC_ENABLE_SMS === 'true',
  whatsappApi: process.env.NEXT_PUBLIC_ENABLE_WHATSAPP_API === 'true',
  digital: process.env.NEXT_PUBLIC_ENABLE_DIGITAL === 'true',
  courses: process.env.NEXT_PUBLIC_ENABLE_COURSES === 'true',
  reviews: (process.env.NEXT_PUBLIC_REVIEWS_MODE ?? 'static') as 'static' | 'dynamic',
  team: process.env.NEXT_PUBLIC_ENABLE_TEAM !== 'false',
  gallery: process.env.NEXT_PUBLIC_ENABLE_GALLERY !== 'false',
} as const;

export type Features = typeof features;
