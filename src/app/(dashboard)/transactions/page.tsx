import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShieldAlert, Activity, CheckCircle2, MoreVertical, Ban, Hand } from "lucide-react"
import { format } from "date-fns"
import TransactionActions from './TransactionActions'
import AutoRefresh from '@/components/AutoRefresh'
import { AnimatedList, AnimatedListItem } from '@/components/AnimatedFeed'

const statusColors = {
  COMPLETED: "bg-green-500/10 text-green-400 border-green-500/20",
  BLOCKED: "bg-red-500/10 text-red-400 border-red-500/20",
  PENDING_APPROVAL: "bg-amber-500/10 text-amber-500 border-amber-500/20"
}

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    include: { agent: true, provider: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <AutoRefresh interval={3000} />
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Transaction Explorer</h2>
        <p className="text-muted-foreground mt-1">
          Global ledger of all autonomous payments and policy interventions.
        </p>
      </header>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium text-muted-foreground grid grid-cols-6 px-4 py-2 border-b border-border/50">
            <div>Agent</div>
            <div>Provider</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Risk</div>
            <div className="text-right">Actions</div>
          </div>
          <AnimatedList className="divide-y divide-border/50">
            {transactions.map((tx) => (
              <AnimatedListItem key={tx.id}>
                <div className="grid grid-cols-6 p-4 items-center gap-4 hover:bg-muted/50 transition-colors">
                  {/* Agent */}
                  <div className="col-span-1 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${tx.status === 'BLOCKED' ? 'bg-red-500/20 text-red-400' : tx.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-500'}`}>
                      {tx.agent.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm truncate">{tx.agent.name}</span>
                  </div>
                  
                  {/* Provider */}
                  <div className="col-span-1">
                    <span className="text-sm">{tx.provider.name}</span>
                  </div>
                  
                  {/* Amount & Rail */}
                  <div className="col-span-1 flex flex-col">
                    <span className="font-medium text-sm">₹{tx.amount}</span>
                    <span className="text-xs text-muted-foreground">{tx.rail === 'LIGHTNING' ? '⚡ Lightning' : '🏦 UPI'}</span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <Badge variant="outline" className={statusColors[tx.status as keyof typeof statusColors]}>
                      {tx.status}
                    </Badge>
                  </div>

                  {/* Risk & Time */}
                  <div className="col-span-1 flex flex-col">
                    <span className={`text-sm ${tx.riskScore > 70 ? 'text-red-400 font-medium' : 'text-muted-foreground'}`}>
                      Risk: {tx.riskScore}/100
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(tx.createdAt, "MMM d, HH:mm")}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end">
                    {tx.status === 'PENDING_APPROVAL' ? (
                      <TransactionActions id={tx.id} />
                    ) : (
                      <button className="p-2 hover:bg-muted rounded-full transition-colors">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>
              </AnimatedListItem>
            ))}
          </AnimatedList>
          {transactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
