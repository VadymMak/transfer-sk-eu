-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum (safe)
DO $$ BEGIN
  CREATE TYPE "StoreMode" AS ENUM ('PHYSICAL', 'ONLINE', 'HYBRID');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TestimonialStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- AlterEnum (safe)
DO $$ BEGIN
  ALTER TYPE "PaymentStatus" ADD VALUE 'DEPOSIT_PAID';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "Vertical" ADD VALUE 'SHOE_MARKET';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "Vertical" ADD VALUE 'SERVICES';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- AlterTable Customer
ALTER TABLE "Customer"
  ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

-- AlterTable Store
ALTER TABLE "Store"
  ADD COLUMN IF NOT EXISTS "aboutImage" TEXT,
  ADD COLUMN IF NOT EXISTS "address" TEXT,
  ADD COLUMN IF NOT EXISTS "alwaysOpen" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "city" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "email" TEXT,
  ADD COLUMN IF NOT EXISTS "facebook" TEXT,
  ADD COLUMN IF NOT EXISTS "founderName" TEXT,
  ADD COLUMN IF NOT EXISTS "galleryLayout" TEXT,
  ADD COLUMN IF NOT EXISTS "googleRating" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "instagramUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "logoUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "mapLat" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "mapLng" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "metadata" JSONB,
  ADD COLUMN IF NOT EXISTS "ogImageUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "openingHours" TEXT,
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "postalCode" TEXT,
  ADD COLUMN IF NOT EXISTS "primaryMode" "StoreMode" NOT NULL DEFAULT 'ONLINE',
  ADD COLUMN IF NOT EXISTS "whatsappPhone" TEXT;

-- CreateTable HeroConfig
CREATE TABLE IF NOT EXISTS "HeroConfig" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Kate Barber Studio',
    "subtitle" TEXT NOT NULL DEFAULT 'Prémiový barber studio v Trenčíne',
    "ctaText" TEXT NOT NULL DEFAULT 'Rezervovať termín',
    "titleI18n" JSONB,
    "subtitleI18n" JSONB,
    "ctaTextI18n" JSONB,
    "imageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HeroConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable GalleryImage
CREATE TABLE IF NOT EXISTS "GalleryImage" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable Testimonial
CREATE TABLE IF NOT EXISTS "Testimonial" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "authorName" TEXT,
    "status" "TestimonialStatus" NOT NULL DEFAULT 'PENDING',
    "locale" TEXT,
    "adminReply" TEXT,
    "adminReplyAt" TIMESTAMP(3),
    "customerId" TEXT,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable ServiceMaster
CREATE TABLE IF NOT EXISTS "ServiceMaster" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bio" TEXT,
    "photo" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ServiceMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable Service
CREATE TABLE IF NOT EXISTS "Service" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "image" TEXT,
    "category" TEXT,
    "metadata" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable Appointment
CREATE TABLE IF NOT EXISTS "Appointment" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "customerId" TEXT,
    "guestName" TEXT,
    "guestPhone" TEXT,
    "guestEmail" TEXT,
    "serviceId" TEXT,
    "masterId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "internalNote" TEXT,
    "smsReminderSent" BOOLEAN NOT NULL DEFAULT false,
    "emailReminderSent" BOOLEAN NOT NULL DEFAULT false,
    "whatsappReminderSent" BOOLEAN NOT NULL DEFAULT false,
    "priceAtBooking" DOUBLE PRECISION,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "paymentId" TEXT,
    "deposit" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable DigitalProduct
CREATE TABLE IF NOT EXISTS "DigitalProduct" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'COURSE',
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "fileUrl" TEXT,
    "videoUrl" TEXT,
    "previewUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DigitalProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable DigitalProductTranslation
CREATE TABLE IF NOT EXISTS "DigitalProductTranslation" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "lessonText" TEXT,
    CONSTRAINT "DigitalProductTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable CourseAccess
CREATE TABLE IF NOT EXISTS "CourseAccess" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "digitalProductId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "stripePaymentId" TEXT,
    "stripeSessionId" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable LegalConfig
CREATE TABLE IF NOT EXISTS "LegalConfig" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "companyName" TEXT NOT NULL DEFAULT '',
    "street" TEXT NOT NULL DEFAULT '',
    "zip" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT 'Deutschland',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "vatId" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LegalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable StoreKnowledge
CREATE TABLE IF NOT EXISTS "StoreKnowledge" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "chunkType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreKnowledge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (safe)
CREATE UNIQUE INDEX IF NOT EXISTS "HeroConfig_storeId_key" ON "HeroConfig"("storeId");
CREATE INDEX IF NOT EXISTS "GalleryImage_storeId_sortOrder_idx" ON "GalleryImage"("storeId", "sortOrder");
CREATE INDEX IF NOT EXISTS "Testimonial_storeId_status_idx" ON "Testimonial"("storeId", "status");
CREATE INDEX IF NOT EXISTS "Testimonial_storeId_createdAt_idx" ON "Testimonial"("storeId", "createdAt");
CREATE INDEX IF NOT EXISTS "Testimonial_customerId_idx" ON "Testimonial"("customerId");
CREATE INDEX IF NOT EXISTS "ServiceMaster_storeId_active_idx" ON "ServiceMaster"("storeId", "active");
CREATE INDEX IF NOT EXISTS "Service_storeId_active_idx" ON "Service"("storeId", "active");
CREATE UNIQUE INDEX IF NOT EXISTS "Service_storeId_slug_key" ON "Service"("storeId", "slug");
CREATE INDEX IF NOT EXISTS "Appointment_storeId_status_idx" ON "Appointment"("storeId", "status");
CREATE INDEX IF NOT EXISTS "Appointment_storeId_date_idx" ON "Appointment"("storeId", "date");
CREATE INDEX IF NOT EXISTS "Appointment_masterId_date_idx" ON "Appointment"("masterId", "date");
CREATE INDEX IF NOT EXISTS "Appointment_customerId_idx" ON "Appointment"("customerId");
CREATE INDEX IF NOT EXISTS "DigitalProduct_storeId_active_idx" ON "DigitalProduct"("storeId", "active");
CREATE INDEX IF NOT EXISTS "DigitalProduct_storeId_type_idx" ON "DigitalProduct"("storeId", "type");
CREATE UNIQUE INDEX IF NOT EXISTS "DigitalProduct_storeId_slug_key" ON "DigitalProduct"("storeId", "slug");
CREATE UNIQUE INDEX IF NOT EXISTS "DigitalProductTranslation_productId_locale_key" ON "DigitalProductTranslation"("productId", "locale");
CREATE INDEX IF NOT EXISTS "CourseAccess_email_idx" ON "CourseAccess"("email");
CREATE INDEX IF NOT EXISTS "CourseAccess_storeId_idx" ON "CourseAccess"("storeId");
CREATE UNIQUE INDEX IF NOT EXISTS "CourseAccess_digitalProductId_email_key" ON "CourseAccess"("digitalProductId", "email");
CREATE UNIQUE INDEX IF NOT EXISTS "LegalConfig_storeId_key" ON "LegalConfig"("storeId");
CREATE INDEX IF NOT EXISTS "StoreKnowledge_storeId_idx" ON "StoreKnowledge"("storeId");

-- AddForeignKey (safe)
DO $$ BEGIN
  ALTER TABLE "HeroConfig" ADD CONSTRAINT "HeroConfig_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ServiceMaster" ADD CONSTRAINT "ServiceMaster_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Service" ADD CONSTRAINT "Service_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "ServiceMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DigitalProduct" ADD CONSTRAINT "DigitalProduct_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DigitalProductTranslation" ADD CONSTRAINT "DigitalProductTranslation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "DigitalProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CourseAccess" ADD CONSTRAINT "CourseAccess_digitalProductId_fkey" FOREIGN KEY ("digitalProductId") REFERENCES "DigitalProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "LegalConfig" ADD CONSTRAINT "LegalConfig_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
