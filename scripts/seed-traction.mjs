import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Fetching agents and providers...')
  const agents = await prisma.agent.findMany({ include: { policy: true, wallet: true } })
  const providers = await prisma.provider.findMany()

  if (agents.length === 0 || providers.length === 0) {
    console.error('No agents or providers found. Please run the setup scripts first.')
    return
  }

  console.log('Seeding heavy traction (200 transactions over 14 days)...')

  const now = new Date()
  let createdCount = 0

  for (let i = 0; i < 200; i++) {
    // Randomize date within the last 14 days
    const daysAgo = Math.floor(Math.random() * 14)
    const hoursAgo = Math.floor(Math.random() * 24)
    const txDate = new Date(now)
    txDate.setDate(now.getDate() - daysAgo)
    txDate.setHours(now.getHours() - hoursAgo)

    // Randomize agent and provider
    const agent = agents[Math.floor(Math.random() * agents.length)]
    const provider = providers[Math.floor(Math.random() * providers.length)]

    // Randomize amount based on agent policy (usually normal, sometimes high)
    const isAnomaly = Math.random() > 0.9
    let amount = 0
    if (isAnomaly) {
      amount = agent.policy.transactionLimit * 1.5 // Attempted breach
    } else {
      amount = Math.floor(Math.random() * (agent.policy.transactionLimit * 0.8)) + 10
    }

    // Determine status
    let status = 'COMPLETED'
    let riskScore = provider.riskScore + Math.floor(Math.random() * 20)
    let policyDecision = 'ALLOW'

    if (amount > agent.policy.transactionLimit || riskScore > 75) {
      status = 'BLOCKED'
      policyDecision = 'BLOCK'
      riskScore = Math.max(riskScore, 85)
    } else if (amount > agent.policy.approvalThreshold) {
      status = 'PENDING_APPROVAL'
      policyDecision = 'APPROVAL_REQUIRED'
    }

    // Determine rail
    const allowedRails = JSON.parse(agent.policy.allowedRails || '["UPI", "LIGHTNING"]')
    const rail = allowedRails.includes('LIGHTNING') && provider.lightningEnabled 
      ? 'LIGHTNING' 
      : 'UPI'

    await prisma.transaction.create({
      data: {
        agentId: agent.id,
        providerId: provider.id,
        amount,
        category: provider.category,
        rail,
        riskScore: Math.min(100, riskScore),
        policyDecision,
        status,
        createdAt: txDate,
        completedAt: status === 'COMPLETED' ? txDate : null,
        auditEvents: {
          create: [
            { type: 'POLICY_CHECK', message: `Policy decision: ${policyDecision}`, createdAt: txDate },
            { type: 'RISK_EVALUATION', message: `Historical simulated risk score: ${riskScore}`, createdAt: txDate }
          ]
        }
      }
    })

    createdCount++
    if (createdCount % 20 === 0) {
      console.log(`Created ${createdCount} transactions...`)
    }
  }

  console.log('Successfully injected 200 historical transactions into the database!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
