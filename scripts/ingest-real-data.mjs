import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'

const prisma = new PrismaClient()

async function main() {
  console.log('Downloading simulated real-world CSV dataset...')
  
  // In Phase 4, we generate a highly realistic mocked CSV that mirrors a Kaggle dataset format.
  // In a production scenario, you would fetch from a GitHub raw URL or AWS S3.
  const csvContent = `transaction_id,merchant_name,mcc,amount,timestamp,is_fraud
tx_101,Amazon Web Services,5411,150.00,2026-08-30T10:00:00Z,0
tx_102,OpenAI API,5812,45.50,2026-08-30T14:30:00Z,0
tx_103,Unknown Russian Server,4829,3500.00,2026-08-30T23:15:00Z,1
tx_104,Anthropic Claude,5812,12.00,2026-08-31T09:00:00Z,0
tx_105,Stripe Fees,7399,5.00,2026-08-31T11:00:00Z,0`

  const rows = csvContent.split('\n').slice(1)
  
  const agents = await prisma.agent.findMany()
  if (agents.length === 0) {
    console.error('No agents found. Run setup scripts first.')
    return
  }

  console.log('Ingesting data into Prisma...')
  
  for (const row of rows) {
    if (!row.trim()) continue
    
    const [txId, merchantName, mcc, amountStr, timestampStr, isFraud] = row.split(',')
    const amount = parseFloat(amountStr)
    const timestamp = new Date(timestampStr)
    const fraudFlag = isFraud === '1'

    // Create or find provider based on real CSV data
    let provider = await prisma.provider.findFirst({ where: { name: merchantName } })
    if (!provider) {
      provider = await prisma.provider.create({
        data: {
          name: merchantName,
          category: 'Ingested Data',
          price: amount,
          lightningEnabled: false,
          upiEnabled: true,
          riskScore: fraudFlag ? 90 : 20,
          verified: !fraudFlag,
          rating: 4.5,
          availability: 99.9
        }
      })
    }

    const agent = agents[Math.floor(Math.random() * agents.length)]

    // Insert real historical transaction
    await prisma.transaction.create({
      data: {
        agentId: agent.id,
        providerId: provider.id,
        amount,
        category: provider.category,
        rail: 'FIAT',
        riskScore: fraudFlag ? 95 : 15,
        policyDecision: fraudFlag ? 'BLOCK' : 'ALLOW',
        status: fraudFlag ? 'BLOCKED' : 'COMPLETED',
        createdAt: timestamp,
        completedAt: fraudFlag ? null : timestamp,
        auditEvents: {
          create: [{ type: 'DATA_INGESTION', message: `Imported from CSV. Fraud Flag: ${fraudFlag}` }]
        }
      }
    })
  }

  console.log('Ingestion complete! Check your MESH Dashboard.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
