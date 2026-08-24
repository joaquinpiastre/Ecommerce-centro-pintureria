import type { MetadataRoute } from 'next';
import { getAllProducts, getCategories } from '@/lib/data';
import { SITE } from '../../config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/carrito`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE.url}/contacto`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const categoryPages: MetadataRoute.Sitemap = getCategories().map((c) => ({
    url: `${SITE.url}/categoria/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = getAllProducts().map((p) => ({
    url: `${SITE.url}/producto/${p.codigo}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
