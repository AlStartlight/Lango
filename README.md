# Lingo - Language Learning Platform

A multi-language learning platform built with Next.js 16, featuring professional SEO, privacy compliance, and internationalization.

## Features

### Multi-Language Support
- 12 languages: English, Spanish, Japanese, Korean, Hindi, German, Arabic, French, Portuguese, Italian, Dutch, Indonesian
- Dynamic routing with `/[lang]/` structure
- i18next integration for translations

### SEO Optimization
- Dynamic metadata with `generateMetadata` for all pages
- Open Graph and Twitter Card support
- JSON-LD structured data for rich snippets
- Dynamic sitemap generation with hreflang tags
- robots.txt configuration
- Canonical URLs for all pages

### Privacy & Compliance
- GDPR-compliant cookie consent banner
- Privacy policy, terms of service, and cookie policy pages
- Cookie preference management
- 6-month consent expiration with re-prompting
- Analytics with consent-gated tracking

### Performance
- Google Analytics 4 with anonymized IP
- Web Vitals monitoring (CLS, FID, FCP, LCP, TTFB, INP)
- Edge runtime for OG image generation
- Next.js Image optimization
- Security headers and CSP configuration

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your configuration
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Environment Variables

See `.env.example` for required environment variables:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics 4 Measurement ID
- `NEXT_PUBLIC_SITE_URL` - Your site URL
- `NEXT_PUBLIC_SITE_NAME` - Your site name

## Project Structure

```
app/
├── [lang]/                    # Multi-language routes
│   ├── aboutus/              # About Us page
│   ├── cookies/              # Cookie Policy page
│   ├── how-its-works/        # How It Works page
│   ├── languages/            # Languages page
│   ├── pricing/              # Pricing page
│   ├── privacy/              # Privacy Policy page
│   ├── reviews/              # Reviews page
│   ├── terms/                # Terms of Service page
│   ├── layout.tsx            # Language layout
│   └── page.tsx              # Home page
├── api/
│   ├── health/               # Health check endpoint
│   └── og/                   # Dynamic OG image generation
├── components/
│   ├── analytics/            # Google Analytics, Web Vitals
│   ├── legal/                # Legal page components
│   ├── privacy/              # Cookie consent banner
│   ├── providers/            # Client-side providers
│   ├── seo/                  # SEO components (JSON-LD, Metadata)
│   ├── social/               # Social sharing buttons
│   └── organisms/            # Reusable UI components
├── locales/                  # Translation files
├── utils/
│   ├── analytics.ts          # Analytics utilities
│   ├── consent.ts            # Cookie consent management
│   ├── flags.ts              # Language flag utilities
│   └── metadata.ts           # Metadata generation utilities
├── i18n-config.ts            # Language configuration
├── i18n.ts                   # i18next setup
├── layout.tsx                # Root layout
├── middleware.ts             # Next.js middleware
├── page.tsx                  # Root redirect
├── sitemap.ts                # Dynamic sitemap generation
└── globals.css               # Global styles
```

## API Routes

- `GET /api/health` - Health check endpoint
- `GET /api/og?title=...&subtitle=...&type=...` - Dynamic Open Graph image generation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary. All rights reserved.
