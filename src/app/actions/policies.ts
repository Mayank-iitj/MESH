'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updatePolicy(policyId: string, data: { transactionLimit: number, dailyLimit: number, approvalThreshold: number }) {
  await prisma.policy.update({
    where: { id: policyId },
    data: {
      transactionLimit: data.transactionLimit,
      dailyLimit: data.dailyLimit,
      approvalThreshold: data.approvalThreshold
    }
  })
  
  revalidatePath('/policies')
}
