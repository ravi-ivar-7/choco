import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://usechoco.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/login',
    '/register',
    '/dashboard',
    '/docs',
    '/faqs',
    '/privacy',
    '/terms'
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : route === '/dashboard' ? 0.9 : 0.8,
  }))

  return routes
}
