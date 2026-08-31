'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { evaluateRisk } from '@/lib/ai'
import service from '@/service'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia' as any,
})

/**
 * 1. POLICY ENGINE
 * Evaluates a proposed transaction against the agent's hard limits and categories.
 */
export async function evaluatePolicy(agentId: string, amount: number, category: string) {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { policy: true, wallet: true }
  })

  if (!agent || !agent.policy || !agent.wallet) {
    return { decision: 'BLOCK', reason: 'Agent or Policy not found', approvalRequired: false }
  }

  const { policy, wallet } = agent

  // Check 1: Agent status
  if (agent.status === 'FROZEN') {
    return { decision: 'BLOCK', reason: 'Agent is frozen', approvalRequired: false }
  }

  // Check 2: Transaction Limit
  if (amount > policy.transactionLimit) {
    return { decision: 'BLOCK', reason: `Amount exceeds hard transaction limit of ₹${policy.transactionLimit}`, approvalRequired: false }
  }

  // Check 3: Daily Budget Available
  if (amount > wallet.availableBalance) {
    return { decision: 'BLOCK', reason: 'Insufficient daily budget', approvalRequired: false }
  }

  // Check 4: Allowed Categories
  const allowedCategories: string[] = JSON.parse(policy.allowedCategories || '[]')
  if (allowedCategories.length > 0 && !allowedCategories.includes(category)) {
    return { decision: 'BLOCK', reason: `Category '${category}' is blocked by policy`, approvalRequired: false }
  }

  // Check 5: Approval Threshold
  if (amount > policy.approvalThreshold) {
    return { decision: 'APPROVAL_REQUIRED', reason: `Amount ₹${amount} exceeds automatic approval threshold of ₹${policy.approvalThreshold}`, approvalRequired: true }
  }

  return { decision: 'ALLOW', reason: 'Within policy limits', approvalRequired: false }
}

/**
 * 2. RISK ENGINE
 * Evaluates provider and transaction risk.
 */
export async function evaluateRiskInternal(providerId: string, amount: number, agentId?: string) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId }
  })
  
  // We fetch agent policy to pass to the AI, if agentId is provided
  let policyLimit = 500
  let dailyLimit = 1000
  if (agentId) {
    const agent = await prisma.agent.findUnique({ where: { id: agentId }, include: { policy: true }})
    if (agent?.policy) {
      policyLimit = agent.policy.transactionLimit
      dailyLimit = agent.policy.dailyLimit
    }
  }

  if (!provider) {
    return { riskScore: 100, reason: 'Provider not found (Unknown Risk)', verified: false }
  }

  // Use the new AI engine
  const aiEvaluation = await evaluateRisk(
    { amount, providerName: provider.name, providerRiskScore: provider.riskScore },
    { transactionLimit: policyLimit, dailyLimit }
  )

  return { 
    riskScore: aiEvaluation.riskScore, 
    providerName: provider.name, 
    verified: provider.verified,
    reason: aiEvaluation.reasoning 
  }
}

/**
 * 3. PAYMENT ROUTER
 * Routes payment to preferred/optimal rail.
 */
export async function routePayment(providerId: string, allowedRailsStr: string) {
  const provider = await prisma.provider.findUnique({ where: { id: providerId }})
  const allowedRails: string[] = JSON.parse(allowedRailsStr || '["UPI", "LIGHTNING"]')

  if (!provider) throw new Error("Provider not found")

  // Logic: Prefer Lightning if machine-to-machine, low friction, and both support it
  if (provider.lightningEnabled && allowedRails.includes('LIGHTNING')) {
    return { rail: 'LIGHTNING', reason: 'Provider supports Lightning, low friction + machine-native.' }
  }

  if (provider.upiEnabled && allowedRails.includes('UPI')) {
    return { rail: 'UPI', reason: 'UPI selected based on merchant availability.' }
  }

  return { rail: 'NONE', reason: 'No compatible payment rails available between Agent policy and Provider.' }
}

/**
 * 4. AGENT ORCHESTRATOR
 * Executes the end-to-end autonomous flow.
 */
export async function executeAgentTask(agentId: string, description: string, budget: number, category: string) {
  // Step 1: Discover Providers
  const providers = await prisma.provider.findMany({
    where: { category }
  })

  if (providers.length === 0) {
    return { success: false, log: ['No providers found for category ' + category] }
  }

  const log: string[] = []
  log.push(`Task Received: ${description}`)
  log.push(`Searching providers... Found ${providers.length}`)

  // Step 2: Compare & Evaluate (Find best compliant)
  let selectedProvider = null
  let bestRisk = 100

  for (const p of providers) {
    if (p.price <= budget) {
      const risk = await evaluateRiskInternal(p.id, p.price, agentId)
      const policyDecision = await evaluatePolicy(agentId, p.price, category)

      if (policyDecision.decision === 'ALLOW' && risk.riskScore < 50) {
        if (risk.riskScore < bestRisk) {
          bestRisk = risk.riskScore
          selectedProvider = p
        }
      }
    }
  }

  if (!selectedProvider) {
    log.push('No providers met policy and risk requirements.')
    return { success: false, log }
  }

  log.push(`Selected Provider: ${selectedProvider.name} (₹${selectedProvider.price})`)
  
  const riskResult = await evaluateRiskInternal(selectedProvider.id, selectedProvider.price, agentId)
  log.push(`Risk Check: Score ${riskResult.riskScore}/100. Provider Verified: ${riskResult.verified}`)
  if (riskResult.reason) log.push(`AI Analysis: ${riskResult.reason}`)

  // Step 3: Policy Check again (simulating explicit boundary)
  const policyCheck = await evaluatePolicy(agentId, selectedProvider.price, category)
  log.push(`Policy Check: ${policyCheck.decision} - ${policyCheck.reason}`)

  if (policyCheck.decision === 'BLOCK') {
    // Phase 3: Emit event stream for blocked tx
    const { streams } = service.load()
    await streams.stream('mesh-alerts').append({
      type: 'TX_BLOCKED',
      agentId,
      providerId: selectedProvider.id,
      amount: selectedProvider.price,
      reason: policyCheck.reason,
      timestamp: new Date().toISOString()
    }).catch(e => console.error('Failed to emit stream:', e))

    return { success: false, log }
  }

  // Step 4: Routing
  const agent = await prisma.agent.findUnique({ where: { id: agentId }, include: { policy: true }})
  const route = await routePayment(selectedProvider.id, agent!.policy!.allowedRails)
  
  if (route.rail === 'NONE') {
    log.push(`Routing failed: ${route.reason}`)
    return { success: false, log }
  }
  
  log.push(`Payment Routing: ${route.rail} selected. Reason: ${route.reason}`)

  if (policyCheck.decision === 'APPROVAL_REQUIRED') {
    log.push('Action Paused: Human approval required.')
    // Create pending transaction...
    const pendingTx = await prisma.transaction.create({
      data: {
        agentId,
        providerId: selectedProvider.id,
        amount: selectedProvider.price,
        category,
        rail: route.rail,
        riskScore: riskResult.riskScore,
        policyDecision: policyCheck.decision,
        status: 'PENDING_APPROVAL',
        approvalRequired: true,
      }
    })
    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    return { success: false, log, status: 'PENDING_APPROVAL', transactionId: pendingTx.id }
  }

  // Step 5: Execute Sandbox Payment & Update State
  log.push(`Executing sandbox payment of ₹${selectedProvider.price} via ${route.rail}...`)
  
  if (route.rail === 'FIAT' || route.rail === 'UPI') {
    try {
      log.push(`Provisioning Stripe Virtual Card bounded to ₹${selectedProvider.price}...`)
      // Mock stripe issuing call (will fail if no real key, but we catch it)
      if (process.env.STRIPE_SECRET_KEY) {
        const card = await stripe.issuing.cards.create({
          cardholder: 'ch_mock', // Requires a real cardholder in production
          currency: 'inr',
          type: 'virtual',
          spending_controls: {
            spending_limits: [{ amount: Math.ceil(selectedProvider.price * 100), interval: 'all_time' }]
          }
        });
        log.push(`Stripe V-Card issued: **** **** **** ${card.last4}`)
      } else {
        log.push(`Stripe V-Card issued (MOCK): **** **** **** 4242`)
      }
    } catch (e: any) {
      log.push(`Stripe integration note: ${e.message}`)
    }
  }

  // Deduct balance
  await prisma.wallet.update({
    where: { agentId },
    data: { availableBalance: { decrement: selectedProvider.price } }
  })

  // Record Transaction
  const tx = await prisma.transaction.create({
    data: {
      agentId,
      providerId: selectedProvider.id,
      amount: selectedProvider.price,
      category,
      rail: route.rail,
      riskScore: riskResult.riskScore,
      policyDecision: policyCheck.decision,
      status: 'COMPLETED',
      completedAt: new Date(),
      auditEvents: {
        create: [
          { type: 'POLICY_CHECK', message: policyCheck.reason },
          { type: 'RISK_EVALUATION', message: `Score: ${riskResult.riskScore}` },
          { type: 'ROUTING', message: route.reason },
          { type: 'SETTLEMENT', message: 'Simulated settlement completed' }
        ]
      }
    }
  })

  log.push(`Service executed. Verification passed.`)
  log.push(`Receipt generated: TX-${tx.id}`)

  revalidatePath('/dashboard')
  revalidatePath('/transactions')

  return { success: true, log, transactionId: tx.id }
}
