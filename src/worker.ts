import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import http from 'http';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

console.log("🚀 MESH Background Worker (Web Service) starting...");

// Create a dummy HTTP server so Render Free Tier Web Service doesn't crash
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('MESH Cron Worker is healthy and running.\n');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found\n');
  }
});

server.listen(PORT, () => {
  console.log(`🌐 Health check server listening on port ${PORT}`);
});

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
  server.close();
  await prisma.$disconnect();
  process.exit(0);
});
