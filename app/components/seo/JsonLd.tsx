'use client';

import Script from 'next/script';

interface JsonLdProps {
  data: object;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lingo',
    url: 'https://lingo.com',
    logo: 'https://lingo.com/Logo.png',
    description: 'Learn languages online with native speakers. Interactive lessons, flexible scheduling, and personalized learning paths.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-LINGO-01',
      contactType: 'customer service',
      availableLanguage: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Hindi', 'Arabic', 'Dutch', 'Indonesian'],
      areaServed: 'Worldwide',
    },
    sameAs: [
      'https://www.facebook.com/lingoapp',
      'https://www.twitter.com/lingoapp',
      'https://www.instagram.com/lingoapp',
      'https://www.youtube.com/lingoapp',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Language Street',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94105',
      addressCountry: 'US',
    },
  };

  return <JsonLd data={data} />;
}

export function WebsiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lingo',
    url: 'https://lingo.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://lingo.com/{search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={data} />;
}

export function CourseJsonLd({
  name,
  description,
  provider = 'Lingo',
  url,
  image,
  courseMode = 'online',
  duration = 'P12W',
  offers,
}: {
  name: string;
  description: string;
  provider?: string;
  url: string;
  image?: string;
  courseMode?: string;
  duration?: string;
  offers?: {
    price: string;
    priceCurrency: string;
    category?: string;
  };
}) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider,
      url: 'https://lingo.com',
    },
    url,
    courseMode,
    duration,
    educationalLevel: 'Beginner to Advanced',
    inLanguage: 'Multiple',
  };

  if (image) {
    data.image = image;
  }

  if (offers) {
    data.offers = {
      '@type': 'Offer',
      price: offers.price,
      priceCurrency: offers.priceCurrency,
      category: offers.category,
      availability: 'https://schema.org/InStock',
      url,
    };
  }

  return <JsonLd data={data} />;
}

export function LocalBusinessJsonLd({
  name,
  description,
  image,
  address,
  telephone,
  email,
  openingHours,
}: {
  name: string;
  description: string;
  image?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  telephone?: string;
  email?: string;
  openingHours?: string[];
}) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name,
    description,
    url: 'https://lingo.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
  };

  if (image) {
    data.image = image;
  }

  if (telephone) {
    data.telephone = telephone;
  }

  if (email) {
    data.email = email;
  }

  if (openingHours) {
    data.openingHoursSpecification = openingHours.map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    }));
  }

  return <JsonLd data={data} />;
}

export function ReviewJsonLd({
  author,
  reviewBody,
  ratingValue,
  bestRating = 5,
  worstRating = 1,
}: {
  author: string;
  reviewBody: string;
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: author,
    },
    reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue,
      bestRating,
      worstRating,
    },
  };

  return <JsonLd data={data} />;
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={data} />;
}
