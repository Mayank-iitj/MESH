import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { executeAgentTask } from '@/app/actions/engine'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]

    const apiKey = await prisma.apiKey.findUnique({
      where: { key: token }
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'Unauthorized: Invalid API key' }, { status: 401 })
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsed: new Date() }
    })

    const body = await req.json()
    const { agentId, description, amount, category } = body

    if (!agentId || !description || amount == null || !category) {
      return NextResponse.json({ error: 'Bad Request: Missing required fields (agentId, description, amount, category)' }, { status: 400 })
    }

    // Verify agent belongs to the user
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    })

    if (!agent || agent.userId !== apiKey.userId) {
      return NextResponse.json({ error: 'Forbidden: Agent not found or access denied' }, { status: 403 })
    }

    // Trigger MESH Policy Engine via executeAgentTask
    const result = await executeAgentTask(agentId, description, amount, category)

    if (result.success) {
      return NextResponse.json({ success: true, transactionId: result.transactionId, log: result.log })
    } else {
      if (result.status === 'PENDING_APPROVAL') {
         return NextResponse.json({ success: false, status: 'PENDING_APPROVAL', transactionId: result.transactionId, log: result.log }, { status: 202 })
      }
      return NextResponse.json({ success: false, error: 'Transaction blocked by policy or routing failed', log: result.log }, { status: 403 })
    }

  } catch (error: any) {
    console.error('API /v1/checkout error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
