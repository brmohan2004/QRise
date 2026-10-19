import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://qrise.app';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/settings/',
          '/create/',
          '/qr-codes/',
          '/forms/',
          '/webhooks/',
          '/developer/',
          '/custom-types/',
          '/api-keys/',
          '/api-manager/',
          '/checkout/',
          '/onboarding/',
          '/usage/',
          '/embed/',
          '/s/',
          '/f/',
          '/abuse/',
          '/maintenance/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/features',
          '/pricing',
          '/explore',
          '/docs/',
          '/marketplace',
          '/about',
          '/privacy',
          '/terms',
        ],
        disallow: ['/api/', '/embed/', '/s/', '/f/'],
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/features',
          '/pricing',
          '/explore',
          '/docs/',
          '/marketplace',
          '/about',
        ],
        disallow: ['/api/', '/embed/', '/s/', '/f/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
