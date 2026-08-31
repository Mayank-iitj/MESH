import { PrismaClient } from '@prisma/client'

const dbUrl = process.env.DATABASE_URL

if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
  throw new Error(
    `[MESH] DATABASE_URL is missing or invalid.\n` +
    `Expected a URL starting with "postgresql://" or "postgres://".\n` +
    `Got: ${dbUrl ? `"${dbUrl.substring(0, 20)}..."` : 'undefined'}\n` +
    `Fix: Add DATABASE_URL to your Vercel Environment Variables and redeploy.`
  )
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

