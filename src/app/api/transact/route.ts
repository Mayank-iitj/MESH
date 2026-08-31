import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { evaluateRisk } from '@/lib/ai'
import { evaluatePolicy } from '@/app/actions/engine'
import service from '@/service'

// Disable NextAuth for this machine-to-machine API endpoint
export const dynamic = 'force-dynamic'

/**
 * POST /api/transact
 * Entry point for external agents (LangChain, AutoGPT) to request funds.
 */
export async function POST(req: NextRequest) {
  try {
    // In a real app, you would verify an API key here
    // const authHeader = req.headers.get('authorization')
    
    const body = await req.json()
    const { agentId, providerName, amount, category } = body

    if (!agentId || !providerName || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Fetch Agent
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { policy: true, wallet: true }
    })

    if (!agent || !agent.policy || !agent.wallet) {
      return NextResponse.json({ error: 'Agent not found or invalid' }, { status: 404 })
    }

    // 2. Resolve Provider (or create a temporary one for the risk engine)
    let provider = await prisma.provider.findFirst({
      where: { name: providerName }
    })
    
    if (!provider) {
      provider = await prisma.provider.create({
        data: {
          name: providerName,
          category: category || 'General API',
          price: amount,
          lightningEnabled: false,
          upiEnabled: true,
          riskScore: 60, // Default baseline for unknown providers
          verified: false,
          rating: 4.0,
          availability: 99.0
        }
      })
    }

    // 3. AI Risk Evaluation
    const aiEvaluation = await evaluateRisk(
      { amount, providerName: provider.name, providerRiskScore: provider.riskScore },
      { transactionLimit: agent.policy.transactionLimit, dailyLimit: agent.policy.dailyLimit }
    )

    // 4. Policy Engine
    const policyCheck = await evaluatePolicy(agentId, amount, provider.category)
    
    let status = 'COMPLETED'
    if (policyCheck.decision === 'BLOCK' || aiEvaluation.recommendedAction === 'BLOCK') {
      status = 'BLOCKED'
    } else if (policyCheck.decision === 'APPROVAL_REQUIRED' || aiEvaluation.riskScore > 40) {
      status = 'PENDING_APPROVAL'
    }

    // 5. Emit Event if Blocked
    if (status === 'BLOCKED') {
      const { streams } = service.load()
      await streams.stream('mesh-alerts').append({
        type: 'TX_BLOCKED',
        agentId,
        providerName,
        amount,
        reason: aiEvaluation.reasoning,
        timestamp: new Date().toISOString()
      }).catch(e => console.error('Failed to emit stream:', e))
    }

    // 6. Record Transaction
    const tx = await prisma.transaction.create({
      data: {
        agentId,
        providerId: provider.id,
        amount,
        category: provider.category,
        rail: 'API',
        riskScore: aiEvaluation.riskScore,
        policyDecision: policyCheck.decision,
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
        auditEvents: {
          create: [
            { type: 'AI_EVALUATION', message: aiEvaluation.reasoning }
          ]
        }
      }
    })

    // 7. Deduct Wallet if Completed
    if (status === 'COMPLETED') {
      await prisma.wallet.update({
        where: { agentId },
        data: { availableBalance: { decrement: amount } }
      })
    }

    return NextResponse.json({
      transactionId: tx.id,
      status,
      riskScore: aiEvaluation.riskScore,
      reasoning: aiEvaluation.reasoning
    })

  } catch (error: any) {
    console.error('Transact API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
