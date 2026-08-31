'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function registerUser(name: string, email: string, password: string) {
  if (!name || !email || !password) {
    throw new Error('Missing required fields')
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error('User already exists')
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash
    }
  })

  return { id: user.id, email: user.email }
}
