import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Users, BrainCircuit, Shield } from "lucide-react"
import Link from "next/link"
import { getAgents } from '@/app/actions/agents'
import CreateAgentClient from './CreateAgentClient'

export default async function AgentsPage() {
  const agents = await getAgents()

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Agents</h2>
          <p className="text-muted-foreground mt-1">
            Manage your autonomous workforce and set their financial boundaries.
          </p>
        </div>
        <CreateAgentClient />
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Link key={agent.id} href={`/agents/${agent.id}`}>
            <Card className="bg-card/50 border-border/50 hover:bg-card/80 hover:border-blue-500/50 transition-all cursor-pointer group h-full">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-blue-400" />
                </div>
                <div className={`px-2 py-1 text-xs rounded-full border ${
                  agent.status === 'ACTIVE' 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {agent.status}
                </div>
              </div>
              <CardTitle className="mt-4">{agent.name}</CardTitle>
              <CardDescription>{agent.purpose}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs mb-1">Available Funding</span>
                  <span className="font-semibold">₹{(agent as any).wallet?.availableBalance?.toLocaleString() || 0}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-muted-foreground text-xs mb-1">Tx Limit</span>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-400" />
                    <span className="font-medium">₹{(agent as any).policy?.transactionLimit?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
