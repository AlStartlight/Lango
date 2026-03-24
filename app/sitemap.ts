import { MetadataRoute } from 'next';
import { languages } from './i18n-config';

const baseUrl = 'https://lingo.com';

const staticPages = [
  { url: '', priority: 1.0, changefreq: 'daily' as const },
  { url: '/aboutus', priority: 0.8, changefreq: 'weekly' as const },
  { url: '/how-its-works', priority: 0.9, changefreq: 'weekly' as const },
  { url: '/languages', priority: 0.9, changefreq: 'weekly' as const },
  { url: '/pricing', priority: 0.8, changefreq: 'monthly' as const },
  { url: '/reviews', priority: 0.7, changefreq: 'weekly' as const },
  { url: '/privacy', priority: 0.5, changefreq: 'yearly' as const },
  { url: '/terms', priority: 0.5, changefreq: 'yearly' as const },
  { url: '/cookies', priority: 0.5, changefreq: 'yearly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  languages.forEach((lang) => {
    staticPages.forEach((page) => {
      const url = `${baseUrl}/${lang}${page.url}`;

      const alternateUrls: Record<string, string> = {};
      languages.forEach((altLang) => {
        alternateUrls[altLang] = `${baseUrl}/${altLang}${page.url}`;
      });

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page.changefreq,
        priority: page.priority,
        alternates: {
          languages: alternateUrls,
        },
      });
    });
  });

  return sitemapEntries;
}
