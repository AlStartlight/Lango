import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const DB_SCHEMA = process.env.DB_SCHEMA || "lango";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return undefined;

  // `pg` does not understand Prisma's ?schema= query parameter; the schema is
  // passed to the adapter explicitly instead.
  let pgConnectionString = connectionString;
  try {
    const url = new URL(connectionString);
    url.searchParams.delete("schema");
    pgConnectionString = url.toString();
  } catch {
    // Keep the raw string for non-standard connection strings.
  }

  const adapter = new PrismaPg(pgConnectionString, { schema: DB_SCHEMA });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
