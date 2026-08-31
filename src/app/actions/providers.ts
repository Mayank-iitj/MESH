'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createProvider(data: { name: string, category: string, price: number, riskScore: number, verified: boolean, upiEnabled: boolean, lightningEnabled: boolean }) {
  await prisma.provider.create({
    data: {
      name: data.name,
      category: data.category,
      price: data.price,
      riskScore: data.riskScore,
      verified: data.verified,
      upiEnabled: data.upiEnabled,
      lightningEnabled: data.lightningEnabled,
      rating: 5.0,
      availability: 99.99
    }
  })
  
  revalidatePath('/marketplace')
}
