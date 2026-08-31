'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function createApiKey(name: string) {
  const user = await prisma.user.findFirst()
  if (!user) throw new Error("No user found")

  // Generate a key similar to Stripe
  const key = `sk_mesh_${crypto.randomBytes(24).toString('hex')}`

  const apiKey = await prisma.apiKey.create({
    data: {
      name,
      key,
      userId: user.id
    }
  })

  revalidatePath('/apikeys')
  return apiKey
}

export async function deleteApiKey(id: string) {
  await prisma.apiKey.delete({
    where: { id }
  })
  
  revalidatePath('/apikeys')
}
