import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDbUrl(): string {
  // Check prisma/dev.db first
  const prismaDb = path.join(process.cwd(), "prisma", "dev.db");
  if (fs.existsSync(prismaDb)) {
    return `file:${prismaDb}`;
  }

  // Check root dev.db
  const rootDb = path.join(process.cwd(), "dev.db");
  if (fs.existsSync(rootDb)) {
    return `file:${rootDb}`;
  }

  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  return "file:./dev.db";
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDbUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
