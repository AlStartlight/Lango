import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/lib/generated/prisma/client";
async function main() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL missing");
  const u = new URL(raw); u.searchParams.delete("schema");
  const adapter = new PrismaPg(u.toString(), { schema: process.env.DB_SCHEMA || "lango" });
  const prisma = new PrismaClient({ adapter });
  console.log({ users: await prisma.user.count(), sessions: await prisma.session.count() });
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
