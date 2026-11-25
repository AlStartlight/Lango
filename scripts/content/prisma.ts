import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../app/lib/generated/prisma/client";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: ".env" });
dotenvConfig({ path: ".env.local", override: true });

export function createContentPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const url = new URL(connectionString);
  url.searchParams.delete("schema");

  const adapter = new PrismaPg(url.toString(), {
    schema: process.env.DB_SCHEMA || "lango",
  });

  return new PrismaClient({ adapter });
}
