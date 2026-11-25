# Prisma & Database

Database: PostgreSQL schema `lango`, configured through `DATABASE_URL` in `.env`.

## Commands

```bash
npm run db:generate   # regenerate Prisma Client after schema changes
npm run db:check      # connect and count User/Session rows
npm run db:migrate    # apply migrations (prisma migrate deploy)
```

## Notes

- The app passes the schema explicitly to `PrismaPg` (`DB_SCHEMA`, default `lango`).
  `pg` does not understand Prisma's `?schema=` query parameter, so `app/lib/prisma.ts`
  removes it from the connection string before creating the pool.
- The current managed database sits behind a Supavisor transaction pooler. Prisma's
  migration engine acquires a session-level advisory lock, which can time out or
  fail with `prepared statement already exists` through that pooler.
  If `npm run db:migrate` hangs, run the generated SQL from
  `prisma/migrations/*/migration.sql` against the database with
  `PGOPTIONS='-c search_path=lango,public' psql "$DATABASE_URL" -f <file>`.
- The initial migration is recorded in `_prisma_migrations` as
  `20261125000000_init_lango_v1`.
