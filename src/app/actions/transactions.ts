'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function approveTransaction(transactionId: string) {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { provider: true }
  })

  if (!tx || tx.status !== 'PENDING_APPROVAL') throw new Error("Transaction not found or not pending")

  // Deduct balance
  await prisma.wallet.update({
    where: { agentId: tx.agentId },
    data: { availableBalance: { decrement: tx.amount } }
  })

  // Update TX
  await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      auditEvents: {
        create: { type: 'HUMAN_OVERRIDE', message: 'Transaction manually approved by operator.' }
      }
    }
  })

  revalidatePath('/transactions')
  revalidatePath('/')
}

export async function rejectTransaction(transactionId: string) {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId }
  })

  if (!tx || tx.status !== 'PENDING_APPROVAL') throw new Error("Transaction not found or not pending")

  // Update TX
  await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: 'BLOCKED',
      auditEvents: {
        create: { type: 'HUMAN_OVERRIDE', message: 'Transaction manually rejected by operator.' }
      }
    }
  })

  revalidatePath('/transactions')
  revalidatePath('/')
}
