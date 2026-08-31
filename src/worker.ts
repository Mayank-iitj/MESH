import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log("🚀 MESH Background Worker started...");

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log(`[${new Date().toISOString()}] Running wallet replenishment...`);
  try {
    const policies = await prisma.policy.findMany({
      where: { active: true },
      include: { agent: true }
    });
    
    for (const policy of policies) {
      if (policy.agent && policy.agent.status === 'ACTIVE') {
        // Reset their available balance to their daily limit
        await prisma.wallet.update({
          where: { agentId: policy.agentId },
          data: { availableBalance: policy.dailyLimit }
        });
        console.log(`✅ Replenished ${policy.agent.name} wallet to ₹${policy.dailyLimit}`);
      }
    }
    console.log(`[${new Date().toISOString()}] Wallet replenishment complete.`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error during wallet replenishment:`, error);
  }
});

// To prevent process from exiting
process.on('SIGINT', async () => {
  console.log("Shutting down worker...");
  await prisma.$disconnect();
  process.exit(0);
});
