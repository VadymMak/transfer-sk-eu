# E-Market Template — 7-Step Roadmap

**Создан:** 2026-06-07 | **Статус:** Active

---

## Step 1: Lighthouse 95+ (Performance & Bundle)
**Приоритет:** P0 — оптимизировать существующий код ДО добавления фич

### 1.1 — Code splitting: next/dynamic для below-fold секций
- `HomeClient.tsx` сейчас eager-импортирует все 13 home sections
- Обернуть в `next/dynamic` с `ssr: false`: GallerySection, ReservationSection, AboutSection, SubscribeBanner, PopularTags, TrustStrip, BrandsSection
- HeroSection, MenuCategories, CategoriesGrid, BestSellers, ProductOfDay — оставить eager (above-fold)

**Тест:**
- [ ] `pnpm build` — без ошибок
- [ ] Открыть homepage → DevTools → Network tab → JS → проверить что below-fold секции грузятся отдельными chunks
- [ ] Scroll вниз → секции появляются (lazy load работает)
- [ ] Lighthouse Performance score — записать "до" и "после"

### 1.2 — Аудит 'use client': убрать лишние
- Компоненты которые только рендерят props без state/effects → убрать `'use client'`
- Компоненты с `useTranslations()` → заменить на `getTranslations()` server-side где возможно
- Цель: сократить с 54 до ~25-30 client компонентов

**Тест:**
- [ ] `npx tsc --noEmit` — без ошибок
- [ ] `pnpm build` — без ошибок
- [ ] Все страницы визуально работают (homepage, catalog, product, cart, checkout)
- [ ] DevTools → Network → JS bundle size уменьшился

### 1.3 — Suspense boundaries
- Обернуть data-fetching секции homepage в `<Suspense fallback={<Skeleton/>}>`
- Добавить простые skeleton placeholders (div с анимацией)

**Тест:**
- [ ] Homepage грузится progressively (скелетоны → контент)
- [ ] Throttle network (Slow 3G) → видно streaming эффект
- [ ] Нет layout shift (CLS < 0.1)

### 1.4 — manifest.json + meta
- Создать `src/app/manifest.ts` (name, icons, theme_color, display)
- Добавить `viewport` и `themeColor` в root layout metadata
- Добавить `<link rel="preconnect">` для `*.blob.vercel-storage.com`

**Тест:**
- [ ] `curl localhost:3000/manifest.json` — валидный JSON
- [ ] Lighthouse → Best Practices → "Has web app manifest" = pass
- [ ] Lighthouse → Performance → "Preconnect to required origins" = pass

### 1.5 — next.config.ts cleanup
- `poweredByHeader: false`
- `optimizePackageImports: ['zustand', 'zod']`
- Установить `@next/bundle-analyzer` → проверить bundle sizes

**Тест:**
- [ ] Response headers не содержат `X-Powered-By`
- [ ] Bundle analyzer report — нет неожиданно больших chunks
- [ ] `pnpm build` → записать размеры chunks

### 1.6 — Cleanup dead code
- Удалить неиспользуемые exports из `src/data/products.ts`
- Удалить `dotenv` из dependencies (Next.js handles env natively)
- Проверить `bcryptjs` — если только в seed, перенести в devDependencies

**Тест:**
- [ ] `npx tsc --noEmit` — без ошибок
- [ ] `pnpm build` — без ошибок
- [ ] Seed script по-прежнему работает

### Финальный тест Step 1:
- [ ] **Lighthouse Desktop:** Performance ≥ 95, SEO ≥ 95, Best Practices ≥ 95, Accessibility ≥ 90
- [ ] **Lighthouse Mobile:** Performance ≥ 85
- [ ] Все страницы работают: homepage, catalog, product, cart, checkout, compare, favorites

---

## Step 2: N3 — Templates (Theme Presets)
**Приоритет:** Quick win — расширяет существующий ThemeConfig

### 2.1 — Создать 6 preset'ов в коде
Добавить `src/lib/theme-presets.ts` с готовыми конфигурациями:
- **Classic** — белый фон, синий primary (#3b82f6), shadow cards, rounded
- **Warm** — кремовый фон, оранжевый primary (#ea580c), border cards, rounded
- **Dark** — тёмный фон (#0f172a), зелёный primary (#22c55e), flat cards, sharp
- **Bold** — яркие цвета, красный primary (#dc2626), shadow cards, pill
- **Natural** — зелёные тона (#15803d), тёплый фон, border cards, rounded
- **Medical** — голубой primary (#0ea5e9), чистый белый, border cards, rounded

Каждый preset = полный `ThemeConfig` объект (colors + layout).

### 2.2 — Template selector в admin Theme page
- Добавить секцию "Quick presets" вверху Theme editor
- 6 карточек с preview (цветной квадрат + имя)
- Клик → заполняет форму значениями из preset
- Кнопка "Apply" → сохраняет в DB

### 2.3 — AI tool: apply_template
- Добавить tool в chat API: `apply_template` (name: string)
- AI может: "примени тёмную тему" → вызывает apply_template("dark")

**Тест Step 2:**
- [ ] Admin → Theme → видно 6 карточек preset'ов
- [ ] Клик на "Dark" → форма заполняется тёмными цветами
- [ ] "Apply" → сайт перекрашивается в тёмную тему
- [ ] Клик на "Classic" → сайт возвращается к светлой теме
- [ ] AI чат → "примени тёплую тему" → сайт перекрашивается
- [ ] ElectroMarket и Adriano оба работают с preset'ами
- [ ] `npx tsc --noEmit` — без ошибок

---

## Step 3: L5 — Onboarding Wizard
**Приоритет:** UX — первое впечатление нового клиента

### 3.1 — DB: поле setupComplete
- Добавить `setupComplete Boolean @default(false)` в Store model
- Migration

### 3.2 — Onboarding page /admin/onboarding
- 5-step wizard (stepper UI):
  1. **Store info** — name, description, phone, email, address
  2. **Branding** — logo upload, выбор template preset (из Step 2)
  3. **Categories** — добавить/редактировать категории
  4. **First products** — добавить 1-3 продукта (упрощённая форма)
  5. **Review & Launch** — summary, кнопка "Запустити магазин"
- После "Запустити" → `setupComplete = true` → redirect to dashboard

### 3.3 — Redirect logic
- В admin panel layout: если `setupComplete === false` → redirect to `/admin/onboarding`
- В onboarding: если `setupComplete === true` → redirect to `/admin`

**Тест Step 3:**
- [ ] Новый магазин (setupComplete=false) → после логина redirect на /admin/onboarding
- [ ] Wizard: все 5 шагов проходятся
- [ ] Step 1: заполнить инфо → Next
- [ ] Step 2: выбрать template preset → Next
- [ ] Step 3: добавить категорию → Next
- [ ] Step 4: добавить продукт (с фото) → Next
- [ ] Step 5: Review → "Запустити" → redirect на dashboard
- [ ] Повторный логин → сразу dashboard (не wizard)
- [ ] Adriano (setupComplete=true) → wizard не показывается
- [ ] `npx tsc --noEmit` — без ошибок

---

## Step 4: N5-V2 — Smart Suggestions (Related Products)
**Приоритет:** Revenue — использует уже готовый pgvector

### 4.1 — API endpoint: /api/products/related
- Input: productId, limit (default 4)
- Logic: взять embedding текущего продукта → pgvector cosine search → исключить сам продукт → вернуть top-N
- Fallback: если нет embedding → вернуть продукты из той же категории (random)

### 4.2 — Компонент RelatedProducts
- Server component (fetch в API)
- Горизонтальная карусель/grid из 4 ProductCard
- Заголовок: "Вам також може сподобатися" (через i18n)
- Добавить на product page (после основного контента)

### 4.3 — Embeddings batch job
- Script/API для генерации embeddings всех продуктов у которых `embedding IS NULL`
- Вызывать при seed или вручную через admin

**Тест Step 4:**
- [ ] Product page → внизу секция "Вам також може сподобатися"
- [ ] 4 карточки товаров (не включая текущий)
- [ ] Товары релевантные (похожая категория или семантически близкие)
- [ ] Клик на рекомендацию → открывает product page → там тоже есть рекомендации
- [ ] Нет рекомендаций → fallback: товары из той же категории
- [ ] На Adriano: "К пицце рекомендуем..." показывает другие блюда
- [ ] `npx tsc --noEmit` — без ошибок

---

## Step 5: N4 — AI Product Tools
**Приоритет:** Productivity — AI помогает создавать товары

### 5.1 — API: /api/admin/ai/generate-description
- Input: productName, category, vertical, locale
- Output: description (2-3 предложения), SEO title, meta description
- Provider: OpenAI GPT-4o-mini

### 5.2 — Кнопка "AI опис" в ProductModal
- Рядом с полем description → иконка ✨ + "Згенерувати"
- Клик → вызов API → заполнение поля
- Loading state + возможность редактировать результат

### 5.3 — AI category suggestion
- При вводе имени продукта → автоматически предложить категорию
- Используем embedding similarity: compare product name embedding с category embeddings
- Показать как chip/badge рядом с dropdown: "Пропонуємо: Pizza"

### 5.4 — AI SEO в product page metadata
- При сохранении продукта: если нет description → auto-generate через AI
- Сохранять в product.metadata.description

**Тест Step 5:**
- [ ] Admin → Products → Edit/Add → кнопка "Згенерувати" видна
- [ ] Клик → loading → описание появляется
- [ ] Описание на правильном языке (украинский для Adriano)
- [ ] Описание релевантное (для пиццы — про пиццу, не про дрели)
- [ ] Category suggestion: ввести "Margherita" → предложит "Pizza"
- [ ] Product page → View Source → meta description заполнен
- [ ] `npx tsc --noEmit` — без ошибок

---

## Step 6: N1 — Blog MDX
**Приоритет:** SEO + content marketing

### 6.1 — Prisma model: BlogPost
- Fields: id, slug, title, content (text), excerpt, coverImage, locale, published, publishedAt, author, tags, storeId
- Migration

### 6.2 — Admin: /admin/blog
- Список постов (draft/published)
- Create/Edit form: title, slug (auto), content (textarea/markdown), excerpt, cover image, tags, locale, publish toggle
- Preview button

### 6.3 — Store: /[locale]/blog
- Blog listing page — карточки с cover, title, excerpt, date
- Blog post page: /[locale]/blog/[slug] — rendered markdown, cover image, author, date
- SEO: generateMetadata с OG, hreflang
- JSON-LD: BlogPosting schema

### 6.4 — Sidebar nav + sitemap
- Добавить "Блог" в store navigation (Header)
- Добавить blog URLs в sitemap.ts

**Тест Step 6:**
- [ ] Admin → Blog → пустой список
- [ ] Create post → заполнить → Save as Draft
- [ ] Publish → пост появляется на /uk/blog
- [ ] Blog listing: карточки с cover, title, date
- [ ] Blog post: полный текст, cover image, formatted markdown
- [ ] SEO: View Source → OG meta, JSON-LD BlogPosting
- [ ] sitemap.xml включает blog URLs
- [ ] Draft не показывается на сайте
- [ ] Multi-locale: /en/blog/[slug] vs /uk/blog/[slug]
- [ ] `npx tsc --noEmit` — без ошибок

---

## Step 7: L2 — Stripe Connect
**Приоритет:** Monetization — реальная оплата

### 7.1 — Stripe setup
- `pnpm add stripe @stripe/stripe-js`
- Env vars: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
- `src/lib/stripe.ts` — Stripe instance

### 7.2 — Checkout integration
- API: /api/checkout/create-session → Stripe Checkout Session
- Success/Cancel pages
- Обновить CheckoutForm: при payment method "card" → redirect to Stripe

### 7.3 — Webhook: /api/webhooks/stripe
- Handle: checkout.session.completed → Order status = PAID
- Handle: payment_intent.payment_failed → Order status = FAILED

### 7.4 — Admin: payment status
- Dashboard: показывать paid/unpaid orders
- Order detail: payment status badge

### 7.5 — Stripe Connect (multi-tenant)
- Каждый магазин = Stripe Connected Account
- Platform fee: % от каждого платежа
- Admin settings: кнопка "Підключити Stripe" → OAuth flow

**Тест Step 7:**
- [ ] Checkout → выбрать "Карткою" → redirect на Stripe Checkout
- [ ] Оплатить тестовой картой (4242 4242 4242 4242) → success page
- [ ] Order в admin → статус PAID
- [ ] Webhook: проверить через Stripe CLI (`stripe listen --forward-to`)
- [ ] Отмена → cancel page → order status не меняется
- [ ] Admin Settings → "Підключити Stripe" → OAuth → connected
- [ ] `npx tsc --noEmit` — без ошибок

---

## Tracking

| Step | Name | Status | Commits |
|------|------|--------|---------|
| 1 | Lighthouse 95+ | ⬜ Not started | |
| 2 | N3 Templates | ⬜ Not started | |
| 3 | L5 Onboarding | ⬜ Not started | |
| 4 | N5-V2 Suggestions | ⬜ Not started | |
| 5 | N4 AI Product Tools | ⬜ Not started | |
| 6 | N1 Blog MDX | ⬜ Not started | |
| 7 | L2 Stripe Connect | ⬜ Not started | |
