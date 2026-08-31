import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { evaluateRisk } from '@/lib/ai'

// In a real app, you would use stripe.webhooks.constructEvent to verify the signature
export const dynamic = 'force-dynamic'

/**
 * POST /api/webhooks/stripe
 * Simulates receiving a Stripe Issuing Authorization request webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate it's an issuing_authorization.request
    if (body.type !== 'issuing_authorization.request') {
      return NextResponse.json({ received: true })
    }

    const auth = body.data.object
    const amount = auth.amount / 100 // Stripe amounts are in cents
    const merchantName = auth.merchant_data.name
    
    // In a real integration, the card ID would map to an Agent in our DB
    const cardId = auth.card.id
    
    // Mock mapping: we'll just grab the first agent for demonstration
    const agent = await prisma.agent.findFirst({
      include: { policy: true, wallet: true }
    })

    if (!agent || !agent.policy) {
      return NextResponse.json({ approved: false, decline_code: 'card_inactive' })
    }

    // Run the AI Risk Engine on the physical credit card swipe
    const aiEvaluation = await evaluateRisk(
      { amount, providerName: merchantName, providerRiskScore: 50 },
      { transactionLimit: agent.policy.transactionLimit, dailyLimit: agent.policy.dailyLimit }
    )

    // Log the attempt
    await prisma.transaction.create({
      data: {
        agentId: agent.id,
        providerId: (await prisma.provider.findFirst())?.id || '', // Mock
        amount,
        category: 'Card Swipe',
        rail: 'FIAT',
        riskScore: aiEvaluation.riskScore,
        policyDecision: aiEvaluation.recommendedAction,
        status: aiEvaluation.recommendedAction === 'ALLOW' ? 'COMPLETED' : 'BLOCKED',
        auditEvents: {
          create: [
            { type: 'STRIPE_WEBHOOK', message: `Merchant: ${merchantName}` },
            { type: 'AI_EVALUATION', message: aiEvaluation.reasoning }
          ]
        }
      }
    })

    // Reply synchronously to Stripe to approve or decline the real swipe
    if (aiEvaluation.recommendedAction === 'BLOCK') {
      return NextResponse.json({ approved: false, decline_code: 'fraudulent' })
    } else {
      return NextResponse.json({ approved: true })
    }

  } catch (error: any) {
    console.error('Stripe Webhook Error:', error)
    return NextResponse.json({ approved: false }, { status: 500 })
  }
}
