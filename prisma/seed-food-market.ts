import { PrismaClient, Vertical, DeliveryMode, OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcryptjs from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter } as never);

async function main() {
  console.log('🛒 Seeding Krajina Fresh Market (Food Market)...');

  // ============ STORE ============
  const store = await db.store.upsert({
    where: { slug: 'krajina' },
    update: {
      primaryMode: 'HYBRID',
      address: 'Marktstraße 15',
      city: 'Berlin',
      openingHours: 'Mon-Sat 7:00-20:00',
      phone: '+49 30 1234 5678',
      email: 'hello@krajina.eu',
      mapLat: 52.5200,
      mapLng: 13.4050,
      regionBundle: 'EU',
    },
    create: {
      name: 'Krajina Fresh Market',
      slug: 'krajina',
      vertical: Vertical.FOOD_MARKET,
      primaryMode: 'HYBRID',
      address: 'Marktstraße 15',
      city: 'Berlin',
      openingHours: 'Mon-Sat 7:00-20:00',
      phone: '+49 30 1234 5678',
      email: 'hello@krajina.eu',
      mapLat: 52.5200,
      mapLng: 13.4050,
      regionBundle: 'EU',
      themeConfig: {
        colors: {
          bg:             '#fafaf5',
          primary:        '#4d7c0f',
          primaryDark:    '#365314',
          primaryLight:   '#f7fee7',
          text:           '#1c1917',
          textSecondary:  '#78716c',
          textMuted:      '#a8a29e',
          border:         '#e7e5e4',
          bgSubtle:       '#f5f5f0',
          success:        '#16a34a',
          error:          '#ef4444',
          contrast:       '#ffffff',
          overlay:        '#ffffff',
          overlayAlpha:   'rgba(250,250,245,0.85)',
          headerBg:       'rgba(250,250,245,0.9)',
          bgDark:         '#1c1917',
          warning:        '#d97706',
          successLight:   '#ecfccb',
          errorLight:     '#fef2f2',
          infoLight:      '#f0fdf4',
        },
        layout: {
          heroType:     'full-width',
          cardStyle:    'shadow',
          navPosition:  'top',
          borderRadius: 'rounded',
        },
      },
    },
  });
  console.log('✅ Store:', store.slug);

  // ============ CATEGORIES ============
  const categoryData = [
    { slug: 'fruits',     nameKey: 'fruits',     sortOrder: 1 },
    { slug: 'vegetables', nameKey: 'vegetables',  sortOrder: 2 },
    { slug: 'dairy',      nameKey: 'dairy',       sortOrder: 3 },
    { slug: 'meat',       nameKey: 'meat',        sortOrder: 4 },
    { slug: 'bakery',     nameKey: 'bakery',      sortOrder: 5 },
    { slug: 'drinks',     nameKey: 'drinks',      sortOrder: 6 },
    { slug: 'frozen',     nameKey: 'frozen',      sortOrder: 7 },
    { slug: 'grocery',    nameKey: 'grocery',     sortOrder: 8 },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const created = await db.category.upsert({
      where: { storeId_slug: { storeId: store.id, slug: cat.slug } },
      update: { nameKey: cat.nameKey },
      create: { ...cat, storeId: store.id },
    });
    categories[cat.slug] = created.id;
  }
  console.log('✅ Categories:', Object.keys(categories).length);

  // ============ PRODUCTS ============
  const productData = [
    // --- Fruits ---
    {
      slug: 'apples-golden',
      nameKey: 'Golden Apples',
      categorySlug: 'fruits',
      price: 2.49,
      rating: 4.5,
      reviewCount: 128,
      inStock: true,
      isHit: true,
      metadata: { weight: '1 kg', expiryDays: 14, temperature: 'room', organic: false, calories: 52 },
    },
    {
      slug: 'bananas',
      nameKey: 'Bananas',
      categorySlug: 'fruits',
      price: 1.79,
      rating: 4.5,
      reviewCount: 97,
      inStock: true,
      isHit: true,
      metadata: { weight: '1 kg', expiryDays: 7, temperature: 'room', organic: false, calories: 89 },
    },
    {
      slug: 'strawberries',
      nameKey: 'Fresh Strawberries',
      categorySlug: 'fruits',
      price: 3.49,
      rating: 5,
      reviewCount: 203,
      inStock: true,
      isNew: true,
      metadata: { weight: '250g punnet', expiryDays: 3, temperature: 'refrigerated', organic: true, calories: 32 },
    },
    {
      slug: 'oranges',
      nameKey: 'Navel Oranges',
      categorySlug: 'fruits',
      price: 2.99,
      rating: 4.5,
      reviewCount: 76,
      inStock: true,
      metadata: { weight: '1 kg', expiryDays: 14, temperature: 'room', organic: false, calories: 47 },
    },

    // --- Vegetables ---
    {
      slug: 'tomatoes-cherry',
      nameKey: 'Cherry Tomatoes',
      categorySlug: 'vegetables',
      price: 2.99,
      rating: 5,
      reviewCount: 154,
      inStock: true,
      isHit: true,
      metadata: { weight: '500g', expiryDays: 5, temperature: 'room', organic: true, calories: 18 },
    },
    {
      slug: 'cucumbers',
      nameKey: 'Cucumbers',
      categorySlug: 'vegetables',
      price: 1.49,
      rating: 4.5,
      reviewCount: 89,
      inStock: true,
      metadata: { weight: '1 kg', expiryDays: 7, temperature: 'room', organic: false, calories: 15 },
    },
    {
      slug: 'potatoes',
      nameKey: 'New Potatoes',
      categorySlug: 'vegetables',
      price: 1.29,
      rating: 4.5,
      reviewCount: 112,
      inStock: true,
      metadata: { weight: '1 kg', expiryDays: 30, temperature: 'room', organic: false, calories: 77 },
    },
    {
      slug: 'salad-mix',
      nameKey: 'Mixed Salad Leaves',
      categorySlug: 'vegetables',
      price: 2.49,
      rating: 5,
      reviewCount: 67,
      inStock: true,
      isNew: true,
      metadata: { weight: '150g', expiryDays: 4, temperature: 'refrigerated', organic: true, calories: 20 },
    },

    // --- Dairy ---
    {
      slug: 'milk-organic',
      nameKey: 'Organic Whole Milk',
      categorySlug: 'dairy',
      price: 1.89,
      rating: 5,
      reviewCount: 198,
      inStock: true,
      isHit: true,
      metadata: { weight: '1 L', expiryDays: 5, temperature: 'refrigerated', organic: true, calories: 64 },
    },
    {
      slug: 'butter-farm',
      nameKey: 'Farm Butter',
      categorySlug: 'dairy',
      price: 3.49,
      rating: 4.5,
      reviewCount: 143,
      inStock: true,
      metadata: { weight: '200g', expiryDays: 30, temperature: 'refrigerated', organic: false, calories: 717 },
    },
    {
      slug: 'greek-yogurt',
      nameKey: 'Greek Yogurt',
      categorySlug: 'dairy',
      price: 2.29,
      rating: 5,
      reviewCount: 87,
      inStock: true,
      isNew: true,
      metadata: { weight: '400g', expiryDays: 14, temperature: 'refrigerated', organic: true, calories: 97 },
    },
    {
      slug: 'cheese-mozzarella',
      nameKey: 'Fresh Mozzarella',
      categorySlug: 'dairy',
      price: 3.99,
      rating: 5,
      reviewCount: 112,
      inStock: true,
      isHit: true,
      metadata: { weight: '250g', expiryDays: 7, temperature: 'refrigerated', organic: false, calories: 280 },
    },

    // --- Meat ---
    {
      slug: 'chicken-fillet',
      nameKey: 'Chicken Breast Fillet',
      categorySlug: 'meat',
      price: 7.99,
      rating: 4.5,
      reviewCount: 167,
      inStock: true,
      isHit: true,
      metadata: { weight: '1 kg', expiryDays: 3, temperature: 'refrigerated', organic: false, calories: 165 },
    },
    {
      slug: 'pork-neck',
      nameKey: 'Pork Neck Steak',
      categorySlug: 'meat',
      price: 8.99,
      rating: 4.5,
      reviewCount: 98,
      inStock: true,
      metadata: { weight: '1 kg', expiryDays: 3, temperature: 'refrigerated', organic: false, calories: 241 },
    },
    {
      slug: 'beef-steak',
      nameKey: 'Beef Ribeye Steak',
      categorySlug: 'meat',
      price: 14.90,
      rating: 5,
      reviewCount: 54,
      inStock: true,
      isNew: true,
      metadata: { weight: '300g', expiryDays: 3, temperature: 'refrigerated', organic: false, calories: 271 },
    },

    // --- Bakery ---
    {
      slug: 'sourdough-bread',
      nameKey: 'Sourdough Bread',
      categorySlug: 'bakery',
      price: 3.49,
      rating: 5,
      reviewCount: 234,
      inStock: true,
      isHit: true,
      metadata: { weight: '500g', expiryDays: 4, temperature: 'room', organic: true, calories: 245 },
    },
    {
      slug: 'croissant',
      nameKey: 'Butter Croissant',
      categorySlug: 'bakery',
      price: 1.79,
      rating: 4.5,
      reviewCount: 178,
      inStock: true,
      metadata: { weight: '80g', expiryDays: 2, temperature: 'room', organic: false, calories: 406 },
    },

    // --- Beverages ---
    {
      slug: 'orange-juice-fresh',
      nameKey: 'Fresh Orange Juice',
      categorySlug: 'drinks',
      price: 3.99,
      rating: 5,
      reviewCount: 145,
      inStock: true,
      isHit: true,
      metadata: { weight: '500 ml', expiryDays: 2, temperature: 'refrigerated', organic: true, calories: 112 },
    },
    {
      slug: 'sparkling-water',
      nameKey: 'Sparkling Mineral Water',
      categorySlug: 'drinks',
      price: 0.99,
      rating: 4.5,
      reviewCount: 67,
      inStock: true,
      metadata: { weight: '1.5 L', expiryDays: 365, temperature: 'room', organic: false, calories: 0 },
    },
    {
      slug: 'kombucha',
      nameKey: 'Organic Kombucha',
      categorySlug: 'drinks',
      price: 4.49,
      rating: 5,
      reviewCount: 43,
      inStock: true,
      isNew: true,
      metadata: { weight: '330 ml', expiryDays: 30, temperature: 'refrigerated', organic: true, calories: 30 },
    },

    // --- Frozen ---
    {
      slug: 'frozen-pizza-margherita',
      nameKey: 'Frozen Margherita Pizza',
      categorySlug: 'frozen',
      price: 4.49,
      rating: 4.5,
      reviewCount: 89,
      inStock: true,
      metadata: { weight: '350g', expiryDays: 180, temperature: 'frozen', organic: false, calories: 266 },
    },
    {
      slug: 'ice-cream-vanilla',
      nameKey: 'Vanilla Ice Cream',
      categorySlug: 'frozen',
      price: 3.99,
      rating: 5,
      reviewCount: 212,
      inStock: true,
      isHit: true,
      metadata: { weight: '500 ml', expiryDays: 365, temperature: 'frozen', organic: false, calories: 207 },
    },
    {
      slug: 'frozen-berries-mix',
      nameKey: 'Frozen Berry Mix',
      categorySlug: 'frozen',
      price: 3.49,
      rating: 5,
      reviewCount: 134,
      inStock: true,
      metadata: { weight: '400g', expiryDays: 365, temperature: 'frozen', organic: true, calories: 55 },
    },

    // --- Grocery ---
    {
      slug: 'olive-oil-extra',
      nameKey: 'Extra Virgin Olive Oil',
      categorySlug: 'grocery',
      price: 8.99,
      rating: 5,
      reviewCount: 187,
      inStock: true,
      isHit: true,
      metadata: { weight: '500 ml', expiryDays: 730, temperature: 'room', organic: true, calories: 884 },
    },
    {
      slug: 'granola',
      nameKey: 'Nut & Seed Granola',
      categorySlug: 'grocery',
      price: 4.99,
      rating: 4.5,
      reviewCount: 98,
      inStock: true,
      isNew: true,
      metadata: { weight: '500g', expiryDays: 90, temperature: 'room', organic: true, calories: 450 },
    },
    {
      slug: 'pasta-spaghetti',
      nameKey: 'Durum Wheat Spaghetti',
      categorySlug: 'grocery',
      price: 1.99,
      rating: 4.5,
      reviewCount: 76,
      inStock: true,
      metadata: { weight: '500g', expiryDays: 730, temperature: 'room', organic: false, calories: 371 },
    },
  ];

  const products: Record<string, string> = {};
  for (const p of productData) {
    const { categorySlug, ...rest } = p;
    const created = await db.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: p.slug } },
      update: {
        nameKey: rest.nameKey,
        price: rest.price,
        currency: 'EUR',
        metadata: rest.metadata ?? {},
        categoryId: categories[categorySlug],
      },
      create: {
        ...rest,
        image: '/placeholder-product.svg',
        images: [],
        currency: 'EUR',
        storeId: store.id,
        categoryId: categories[categorySlug],
      },
    });
    products[p.slug] = created.id;
  }
  console.log('✅ Products:', Object.keys(products).length);

  // ============ ADMIN USER ============
  const adminEmail = 'admin@krajina.eu';
  const passwordHash = await bcryptjs.hash('admin123', 12);

  await db.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Admin',
      role: 'superadmin',
      storeId: store.id,
    },
  });
  console.log('✅ AdminUser:', adminEmail);


  // ============ CUSTOMERS ============
  const customersData = [
    { email: 'anna@example.de', name: 'Anna Müller', phone: '+49 170 1234567' },
    { email: 'jan@example.de', name: 'Jan Schmidt', phone: '+49 151 7654321' },
  ];

  const customerIds: string[] = [];
  for (const c of customersData) {
    const created = await db.customer.upsert({
      where: { storeId_email: { storeId: store.id, email: c.email } },
      update: {},
      create: { ...c, storeId: store.id },
    });
    customerIds.push(created.id);
  }
  console.log('✅ Customers:', customerIds.length);

  // ============ DELIVERY ZONES ============
  const zonesData = [
    { name: 'City Center',  fee: 0,    minOrder: 15, estimatedMin: 30, estimatedMax: 45 },
    { name: 'Greater Area', fee: 2.50, minOrder: 25, estimatedMin: 45, estimatedMax: 60 },
    { name: 'Suburban',     fee: 4.90, minOrder: 35, estimatedMin: 60, estimatedMax: 90 },
  ];

  const zoneIds: string[] = [];
  for (const z of zonesData) {
    const existing = await db.deliveryZone.findFirst({ where: { storeId: store.id, name: z.name } });
    if (!existing) {
      const created = await db.deliveryZone.create({ data: { ...z, storeId: store.id } });
      zoneIds.push(created.id);
    } else {
      zoneIds.push(existing.id);
    }
  }
  console.log('✅ DeliveryZones:', zoneIds.length);

  // ============ SAMPLE ORDERS ============
  const ordersData = [
    {
      orderNumber: 'KRJ-2026-0001',
      status: OrderStatus.DELIVERED,
      customerId: customerIds[0],
      deliveryMode: DeliveryMode.COURIER,
      paymentMethod: 'card',
      paymentStatus: PaymentStatus.PAID,
      subtotal: 347,
      deliveryFee: 0,
      discount: 0,
      total: 347,
      currency: 'EUR',
      items: [
        { productId: products['milk-organic'],  quantity: 2, price: 42 },
        { productId: products['apples-golden'], quantity: 3, price: 45 },
        { productId: products['sourdough-bread'], quantity: 2, price: 65 },
      ],
    },
    {
      orderNumber: 'KRJ-2026-0002',
      status: OrderStatus.PROCESSING,
      customerId: customerIds[1],
      deliveryMode: DeliveryMode.PICKUP,
      paymentMethod: 'liqpay',
      paymentStatus: PaymentStatus.PAID,
      subtotal: 560,
      deliveryFee: 35,
      discount: 0,
      total: 595,
      currency: 'EUR',
      items: [
        { productId: products['chicken-fillet'],  quantity: 1, price: 180 },
        { productId: products['tomatoes-cherry'], quantity: 2, price: 85 },
        { productId: products['olive-oil-extra'], quantity: 1, price: 285 },
      ],
    },
  ];

  for (const order of ordersData) {
    const exists = await db.order.findFirst({ where: { storeId: store.id, orderNumber: order.orderNumber } });
    if (!exists) {
      const { items, ...orderRest } = order;
      await db.order.create({
        data: {
          ...orderRest,
          storeId: store.id,
          deliveryAddress: { city: 'Berlin', country: 'DE' },
          items: { create: items },
        },
      });
    }
  }
  console.log('✅ Orders: 2');

  console.log('\n🎉 Krajina Fresh Market seed complete!');
  console.log(`   Store slug:   ${store.slug}`);
  console.log(`   Admin email:  ${adminEmail}`);
  console.log(`   Admin pass:   admin123`);
  console.log(`   Vertical:     FOOD_MARKET`);
  console.log(`   Products:     ${Object.keys(products).length}`);
  console.log(`   Categories:   ${Object.keys(categories).length}`);
  console.log(`\n💡 To switch: set STORE_SLUG=krajina in .env`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
