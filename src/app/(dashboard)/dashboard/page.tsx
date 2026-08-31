import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, CreditCard, ShieldAlert, Zap } from "lucide-react"
import DemoRunner from '@/components/DemoRunner'
import { formatDistanceToNow } from 'date-fns'
import TransactionActions from '../transactions/TransactionActions'
import AutoRefresh from '@/components/AutoRefresh'
import AnimatedCounter from '@/components/AnimatedCounter'
import { AnimatedList, AnimatedListItem } from '@/components/AnimatedFeed'
import TransactionGlobe from '@/components/TransactionGlobe'

export default async function Dashboard() {
  // Fetch an agent to use for the demo
  const agent = await prisma.agent.findFirst({
    where: { name: 'Research Agent' }
  })

  // Phase 1: Aggregate Data
  const totalSpend = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { status: 'COMPLETED' }
  })

  const activeAgents = await prisma.agent.count({
    where: { status: 'ACTIVE' }
  })

  const lightningTx = await prisma.transaction.count({
    where: { rail: 'LIGHTNING', status: 'COMPLETED' }
  })

  const blockedTx = await prisma.transaction.count({
    where: { status: 'BLOCKED' }
  })

  // Phase 1: Recent Activity & Approvals
  const recentTransactions = await prisma.transaction.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { agent: true, provider: true }
  })

  const pendingApprovals = await prisma.transaction.findMany({
    where: { status: 'PENDING_APPROVAL' },
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { agent: true, provider: true }
  })

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <AutoRefresh interval={3000} />
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground mt-1">
            Monitor agent activity and financial policies.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1 bg-green-500/10 text-green-400 border-green-500/20">
            System Operational
          </Badge>
          <div className="h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center font-semibold text-sm">
            DU
          </div>
        </div>
      </header>

      {/* Top Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Agent Spend</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter className="text-2xl font-bold block" value={totalSpend._sum.amount || 0} prefix="₹" />
            <p className="text-xs text-muted-foreground mt-1">
              All time completed
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Agents</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter className="text-2xl font-bold block" value={activeAgents} />
            <p className="text-xs text-muted-foreground mt-1">
              Currently operational
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lightning Payments</CardTitle>
            <Zap className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter className="text-2xl font-bold block" value={lightningTx} />
            <p className="text-xs text-muted-foreground mt-1">
              Completed over Lightning
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blocked Transactions</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter className="text-2xl font-bold block" value={blockedTx} />
            <p className="text-xs text-muted-foreground mt-1">
              Halted by policy engine
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Transaction Globe */}
        <div className="col-span-full mb-6">
          <TransactionGlobe />
        </div>

        {/* Wire in the backend execution demo */}
        {agent ? (
          <DemoRunner agentId={agent.id} />
        ) : (
          <Card className="col-span-full bg-card/50 border-border/50 p-4">
            <p className="text-red-400">Database not seeded. Run 'npx tsx prisma/seed.ts' to enable the demo.</p>
          </Card>
        )}

        <Card className="col-span-4 bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Autonomous transaction log across all agents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatedList className="space-y-0">
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                recentTransactions.map((tx) => (
                  <AnimatedListItem key={tx.id}>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${tx.status === 'BLOCKED' ? 'bg-red-500/20 text-red-400' : tx.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {tx.agent.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.agent.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx.status === 'BLOCKED' ? 'Attempted' : 'Paid'} {tx.provider.name} via {tx.rail === 'LIGHTNING' ? '⚡ Lightning' : '🏦 UPI'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${tx.status === 'BLOCKED' ? 'text-red-400' : 'text-green-400'}`}>₹{tx.amount}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.status === 'BLOCKED' ? `Blocked - Risk ${tx.riskScore}` : tx.status === 'COMPLETED' ? 'Approved' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </AnimatedListItem>
                ))
              )}
            </AnimatedList>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Approval Required</CardTitle>
            <CardDescription>
              Transactions flagged by the policy engine.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatedList className="space-y-0">
              {pendingApprovals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending approvals.</p>
              ) : (
                pendingApprovals.map((tx) => (
                  <AnimatedListItem key={tx.id}>
                    <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-amber-500 border-amber-500/30">Action Required</Badge>
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(tx.createdAt, { addSuffix: true })}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.agent.name} wants to pay ₹{tx.amount} to {tx.provider.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 border-l-2 border-border/50 pl-2">
                          Risk Score: {tx.riskScore}
                        </p>
                      </div>
                      <div className="mt-2">
                        <TransactionActions id={tx.id} />
                      </div>
                    </div>
                  </AnimatedListItem>
                ))
              )}
            </AnimatedList>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
