import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import AgentCharts from './AgentCharts'
import { Badge } from "@/components/ui/badge"
import { Shield, Banknote, Activity } from "lucide-react"
import Link from 'next/link'
import AgentChatClient from './AgentChatClient'

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      policy: true,
      wallet: true,
      transactions: {
        include: { provider: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!agent) notFound()

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
          <Link href="/agents" className="hover:text-white transition-colors">Agents</Link>
          <span>/</span>
          <span>{agent.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{agent.name}</h2>
          <Badge variant="outline" className={agent.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}>
            {agent.status}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">{agent.purpose}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="p-4 rounded-xl bg-card/50 border border-border/50 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Banknote className="w-4 h-4" />
            <span className="text-sm font-medium">Available Balance</span>
          </div>
          <span className="text-2xl font-bold">₹{agent.wallet?.availableBalance}</span>
        </div>
        <div className="p-4 rounded-xl bg-card/50 border border-border/50 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Transaction Limit</span>
          </div>
          <span className="text-2xl font-bold">₹{agent.policy?.transactionLimit}</span>
        </div>
        <div className="p-4 rounded-xl bg-card/50 border border-border/50 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">Total Transactions</span>
          </div>
          <span className="text-2xl font-bold">{agent.transactions.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold">Transaction History</h3>
          <AgentCharts transactions={agent.transactions} />
        </div>
        
        <div className="flex flex-col gap-4 h-[600px]">
          <h3 className="text-xl font-semibold">Interact with {agent.name}</h3>
          <AgentChatClient agentId={agent.id} agentName={agent.name} />
        </div>
      </div>

    </div>
  )
}
