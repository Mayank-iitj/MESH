import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  // Verify the request is coming from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log(`[${new Date().toISOString()}] Running wallet replenishment via Vercel Cron...`);
  try {
    const policies = await prisma.policy.findMany({
      where: { active: true },
      include: { agent: true }
    });
    
    let replenishedCount = 0;
    
    for (const policy of policies) {
      if (policy.agent && policy.agent.status === 'ACTIVE') {
        // Reset their available balance to their daily limit
        await prisma.wallet.update({
          where: { agentId: policy.agentId },
          data: { availableBalance: policy.dailyLimit }
        });
        console.log(`✅ Replenished ${policy.agent.name} wallet to ₹${policy.dailyLimit}`);
        replenishedCount++;
      }
    }
    
    console.log(`[${new Date().toISOString()}] Wallet replenishment complete.`);
    return NextResponse.json({ success: true, replenishedCount });
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Error during wallet replenishment:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
