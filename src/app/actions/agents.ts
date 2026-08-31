'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getAgents() {
  return prisma.agent.findMany({
    include: {
      wallet: true,
      policy: true,
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createAgent(data: {
  name: string,
  purpose: string,
  initialFunding: number,
  transactionLimit: number,
  allowedRails: string[]
}) {
  // Get first user (mock auth)
  const user = await prisma.user.findFirst()
  if (!user) throw new Error("No user found")

  const newAgent = await prisma.agent.create({
    data: {
      name: data.name,
      purpose: data.purpose,
      userId: user.id,
      wallet: {
        create: {
          balance: data.initialFunding,
          availableBalance: data.initialFunding,
        }
      },
      policy: {
        create: {
          dailyLimit: data.initialFunding,
          weeklyLimit: data.initialFunding * 7,
          monthlyLimit: data.initialFunding * 30,
          transactionLimit: data.transactionLimit,
          riskThreshold: 80,
          approvalThreshold: data.transactionLimit * 0.8,
          allowedCategories: '[]',
          allowedRails: JSON.stringify(data.allowedRails)
        }
      }
    }
  })

  revalidatePath('/agents')
  return newAgent
}
