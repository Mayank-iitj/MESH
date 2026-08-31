import { serveSchedule } from '@prisma/composer-prisma-cloud/cron';
import service, { schedule } from './service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const handler = serveSchedule(service, schedule, {
  replenish: async () => {
    console.log("Replenishing agent wallets...");
    
    // Find all active policies
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
        console.log(`Replenished ${policy.agent.name} wallet to ₹${policy.dailyLimit}`);
      }
    }
    
    console.log("Replenishment complete.");
  },
});

export default handler;
