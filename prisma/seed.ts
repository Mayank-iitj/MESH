import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create a User
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@mesh.agent',
    },
  });

  // 2. Create Providers (12 total)
  const providersData = [
    { name: 'RenderFast', category: 'Compute', price: 240, riskScore: 31, verified: true, upiEnabled: true, lightningEnabled: true, rating: 4.8, availability: 99.4 },
    { name: 'ComputeHub', category: 'Compute', price: 280, riskScore: 18, verified: true, upiEnabled: true, lightningEnabled: false, rating: 4.9, availability: 99.9 },
    { name: 'UltraRender', category: 'Compute', price: 190, riskScore: 78, verified: false, upiEnabled: false, lightningEnabled: true, rating: 3.2, availability: 89.0 },
    { name: 'DataMint', category: 'Data', price: 500, riskScore: 22, verified: true, upiEnabled: true, lightningEnabled: true, rating: 4.5, availability: 99.5 },
    { name: 'SearchMesh', category: 'APIs', price: 240, riskScore: 18, verified: true, upiEnabled: false, lightningEnabled: true, rating: 4.7, availability: 98.9 },
    { name: 'TranslateFlow', category: 'APIs', price: 150, riskScore: 25, verified: true, upiEnabled: true, lightningEnabled: true, rating: 4.6, availability: 99.1 },
    { name: 'VisionAPI', category: 'APIs', price: 300, riskScore: 10, verified: true, upiEnabled: true, lightningEnabled: true, rating: 4.9, availability: 99.9 },
    { name: 'SpeechGrid', category: 'APIs', price: 120, riskScore: 40, verified: false, upiEnabled: true, lightningEnabled: false, rating: 4.0, availability: 95.0 },
    { name: 'CloudPocket', category: 'Storage', price: 80, riskScore: 15, verified: true, upiEnabled: true, lightningEnabled: true, rating: 4.8, availability: 99.8 },
    { name: 'MarketLens', category: 'Data', price: 780, riskScore: 20, verified: true, upiEnabled: true, lightningEnabled: false, rating: 4.5, availability: 99.2 },
    { name: 'GPUGrid', category: 'Compute', price: 450, riskScore: 12, verified: true, upiEnabled: true, lightningEnabled: true, rating: 4.9, availability: 99.9 },
    { name: 'RenderForge', category: 'Compute', price: 210, riskScore: 65, verified: false, upiEnabled: true, lightningEnabled: true, rating: 3.8, availability: 92.5 },
  ];

  const providers = [];
  for (const p of providersData) {
    const provider = await prisma.provider.create({ data: p });
    providers.push(provider);
  }

  // 3. Create Agents (6 total)
  const agentsData = [
    { name: 'Research Agent', purpose: 'Research, APIs, datasets', status: 'ACTIVE' },
    { name: 'Procurement Agent', purpose: 'Purchase digital services', status: 'ACTIVE' },
    { name: 'Travel Agent', purpose: 'Travel/hotel/transport bookings', status: 'ACTIVE' },
    { name: 'Marketing Agent', purpose: 'Ad spend, asset creation', status: 'ACTIVE' },
    { name: 'Data Agent', purpose: 'Data scraping, market lens', status: 'ACTIVE' },
    { name: 'Rogue Agent', purpose: 'Testing limits', status: 'FROZEN' },
  ];

  const policiesData = [
    { dailyLimit: 2000, weeklyLimit: 10000, monthlyLimit: 40000, transactionLimit: 500, riskThreshold: 40, approvalThreshold: 300, allowedCategories: '["Compute", "APIs", "Data"]', allowedRails: '["UPI", "LIGHTNING"]' },
    { dailyLimit: 10000, weeklyLimit: 50000, monthlyLimit: 200000, transactionLimit: 1000, riskThreshold: 50, approvalThreshold: 1000, allowedCategories: '["Compute", "APIs", "Data", "Storage"]', allowedRails: '["UPI", "LIGHTNING"]' },
    { dailyLimit: 15000, weeklyLimit: 70000, monthlyLimit: 300000, transactionLimit: 5000, riskThreshold: 30, approvalThreshold: 5000, allowedCategories: '["Travel"]', allowedRails: '["UPI"]' },
    { dailyLimit: 5000, weeklyLimit: 25000, monthlyLimit: 100000, transactionLimit: 2000, riskThreshold: 35, approvalThreshold: 2000, allowedCategories: '["APIs", "Data"]', allowedRails: '["UPI"]' },
    { dailyLimit: 3000, weeklyLimit: 15000, monthlyLimit: 60000, transactionLimit: 800, riskThreshold: 45, approvalThreshold: 500, allowedCategories: '["Data", "APIs"]', allowedRails: '["LIGHTNING"]' },
    { dailyLimit: 100, weeklyLimit: 500, monthlyLimit: 2000, transactionLimit: 50, riskThreshold: 10, approvalThreshold: 50, allowedCategories: '[]', allowedRails: '["UPI"]' },
  ];

  const agents = [];
  for (let i = 0; i < agentsData.length; i++) {
    const agent = await prisma.agent.create({
      data: {
        userId: user.id,
        name: agentsData[i].name,
        purpose: agentsData[i].purpose,
        status: agentsData[i].status,
        wallet: {
          create: {
            balance: policiesData[i].dailyLimit,
            availableBalance: policiesData[i].dailyLimit,
          }
        },
        policy: {
          create: policiesData[i]
        }
      }
    });
    agents.push(agent);
  }

  // 4. Create Transactions (Mix of COMPLETED, BLOCKED, PENDING approvals)
  const researchAgent = agents[0];
  const procurementAgent = agents[1];

  // A completed lightning transaction
  await prisma.transaction.create({
    data: {
      agentId: researchAgent.id,
      providerId: providers[4].id, // SearchMesh
      amount: 240,
      category: 'APIs',
      rail: 'LIGHTNING',
      riskScore: 18,
      policyDecision: 'ALLOW',
      status: 'COMPLETED',
      completedAt: new Date(),
      auditEvents: {
        create: [
          { type: 'POLICY_CHECK', message: 'Transaction within limits' },
          { type: 'RISK_CHECK', message: 'Risk score 18 acceptable' },
          { type: 'ROUTING', message: 'Lightning selected' },
        ]
      }
    }
  });

  // A blocked transaction due to high risk
  await prisma.transaction.create({
    data: {
      agentId: researchAgent.id,
      providerId: providers[2].id, // UltraRender
      amount: 190,
      category: 'Compute',
      rail: 'LIGHTNING',
      riskScore: 78,
      policyDecision: 'BLOCK',
      status: 'BLOCKED',
      auditEvents: {
        create: [
          { type: 'POLICY_CHECK', message: 'Transaction within limits' },
          { type: 'RISK_CHECK', message: 'Risk score 78 exceeds threshold 40' },
        ]
      }
    }
  });

  // A transaction pending approval
  await prisma.transaction.create({
    data: {
      agentId: researchAgent.id,
      providerId: providers[9].id, // MarketLens
      amount: 780,
      category: 'Data',
      rail: 'UPI',
      riskScore: 20,
      policyDecision: 'APPROVAL_REQUIRED',
      status: 'PENDING',
      approvalRequired: true,
      approval: {
        create: {
          status: 'PENDING'
        }
      },
      auditEvents: {
        create: [
          { type: 'POLICY_CHECK', message: 'Amount 780 exceeds approval threshold 300' },
        ]
      }
    }
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
