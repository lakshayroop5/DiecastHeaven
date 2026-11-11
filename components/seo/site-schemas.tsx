const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.diecastheavenudaipur.in'

export default function SiteSchemas() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Diecast Heaven Udaipur',
      url: baseUrl,
      logo: `${baseUrl}/diecast-heaven-logo.png`,
      sameAs: [
        'https://www.instagram.com/diecast_heaven_udaipur/',
        'https://www.youtube.com/@diecastheaven-udaipur',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Diecast Heaven Udaipur',
      url: baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/catalog?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ToyStore',
      name: 'Diecast Heaven Udaipur',
      url: baseUrl,
      image: `${baseUrl}/diecast-heaven-logo.png`,
      telephone: '+91-9079674984',
      priceRange: '₹₹',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'BVR Super Mart, Block-E, 335, near Goverdhan Villas, Transport Nagar, Hiran Magri',
        addressLocality: 'Udaipur',
        addressRegion: 'Rajasthan',
        postalCode: '313001',
        addressCountry: 'IN',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '10:00',
          closes: '20:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Sunday',
          opens: '10:00',
          closes: '18:00',
        },
      ],
      hasMap: 'https://maps.app.goo.gl/3C6nyt5BbfqXL3hdA',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 24.532529404548388,
        longitude: 73.68694965767143,
      },
      sameAs: [
        'https://www.instagram.com/diecast_heaven_udaipur/',
        'https://www.youtube.com/@diecastheaven-udaipur',
      ],
    },
  ]
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
    />
  )
}
