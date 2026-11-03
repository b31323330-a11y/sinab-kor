import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDbUrl(): string {
  // On Vercel serverless (or Linux AWS Lambda where /var/task is read-only), use /tmp for write access
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDb = path.join("/tmp", "dev.db");
    const sourceDb = path.join(process.cwd(), "prisma", "dev.db");
    const rootSourceDb = path.join(process.cwd(), "dev.db");

    if (!fs.existsSync(tmpDb)) {
      if (fs.existsSync(sourceDb)) {
        try {
          fs.copyFileSync(sourceDb, tmpDb);
        } catch (e) {
          console.warn("Failed to copy prisma/dev.db to /tmp:", e);
        }
      } else if (fs.existsSync(rootSourceDb)) {
        try {
          fs.copyFileSync(rootSourceDb, tmpDb);
        } catch (e) {
          console.warn("Failed to copy dev.db to /tmp:", e);
        }
      }
    }

    if (fs.existsSync(tmpDb)) {
      return `file:${tmpDb}`;
    }
  }

  // Local development fallback
  const prismaDb = path.join(process.cwd(), "prisma", "dev.db");
  if (fs.existsSync(prismaDb)) {
    return `file:${prismaDb}`;
  }

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
