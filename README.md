# Lingo - Language Learning Platform

A multi-language learning platform built with Next.js 16, featuring professional SEO, privacy compliance, and internationalization.

## Features

### Multi-Language Support
- 13 content languages: English, Spanish, Japanese, Mandarin, Korean, Hindi, German, Arabic, French, Portuguese, Italian, Dutch, Indonesian
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

- `DATABASE_URL` - PostgreSQL connection string, including `?schema=lango`
- `AUTH_TOKEN_PEPPER` - at least 16 random characters (generate with `openssl rand -hex 32`)
- `APP_URL` - public app URL used in verification/reset emails
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` - transactional email
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics 4 Measurement ID
- `NEXT_PUBLIC_SITE_URL` - Your site URL
- `NEXT_PUBLIC_SITE_NAME` - Your site name

## Authentication

Lango uses email + password authentication (bcrypt) with database-backed sessions. Clerk is not used. Verification and password-reset emails are sent through the configured SMTP provider; in development, when SMTP is not configured, the email content and links are printed to the server console.

```bash
npm run db:check     # verify the lango schema is reachable
npm run db:generate  # regenerate Prisma Client
npm run db:migrate   # apply migrations (see prisma/README.md if Supavisor blocks the lock)
```

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

## Story-first curriculum

The story library follows [docs/PRD-story-first-curriculum.md](docs/PRD-story-first-curriculum.md). Thirteen languages each have five levels, two arcs per level, 20 episodes per arc, and 10 scenes per episode. Each scene has four supporting materials (vocabulary, grammar, culture, review), so every episode/story contains 50 learning objects.

| Metric | Count |
| --- | ---: |
| Languages | 13 |
| Episodes / stories | 2,600 |
| Scenes | 26,000 |
| Supporting materials | 104,000 |
| Learning objects (scene + 4) | 130,000 |
| Lines | 252,528 |
| Exercises | 130,000 |

```bash
npm run content:stories:generate -- --lang=ja   # expand a language pack
npm run content:stories:validate                # schema/count/romanization QA
npm run content:stories:report                  # refresh content/stories/manifest.json
npm run test:story                              # 13-language library + counts test
npm run content:stories:check -- --lang=ja      # authoring pack check
npm run content:stories:import -- --lang=ja     # optional bulk PostgreSQL import
```

Authoring sources live in `content/stories/{lang}/world.json` and `kit.json`; generated libraries live in `content/stories/{lang}/library/`. The reader serves the immutable library files, while progress, passports, choices, flags, and attempts are stored in PostgreSQL. `StoryReview` rows start as `pending`: native language, culture, and pedagogy sign-off is still required before the content can be called human-reviewed.
