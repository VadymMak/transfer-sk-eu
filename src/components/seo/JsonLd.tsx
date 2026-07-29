type JsonLdData = Record<string, unknown>;

// Legacy default export: generic JSON-LD (used by ecommerce pages for breadcrumbs/product schema)
export default function JsonLdGeneric({ data }: { data: JsonLdData | JsonLdData[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Named export: TaxiService + LocalBusiness schema for Transfer GmbH
export function JsonLd({ store }: { store: { name: string; address?: string; city?: string; phone?: string; email?: string; mapLat?: number | null; mapLng?: number | null } }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'TaxiService'],
    name: store.name || 'Transfer GmbH',
    description: 'Professionelle Flughafentransfers Wien ⇄ Bratislava. Festpreise, lizenziert, 24/7.',
    url: 'https://transfer-gmbh.at',
    telephone: store.phone || '+43 664 000 00 00',
    email: store.email || 'info@transfer-gmbh.at',
    address: {
      '@type': 'PostalAddress',
      streetAddress: store.address || 'Wiedner Hauptstraße 120',
      addressLocality: store.city || 'Wien',
      postalCode: '1050',
      addressCountry: 'AT',
    },
    ...(store.mapLat && store.mapLng ? {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: store.mapLat,
        longitude: store.mapLng,
      },
    } : {}),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    areaServed: [
      { '@type': 'City', name: 'Wien' },
      { '@type': 'City', name: 'Bratislava' },
      { '@type': 'Country', name: 'Austria' },
      { '@type': 'Country', name: 'Slovakia' },
    ],
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Cash, Credit Card',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
