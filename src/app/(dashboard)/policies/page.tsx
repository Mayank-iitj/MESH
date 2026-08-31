import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Shield, Plus } from "lucide-react"
import EditPolicyClient from './EditPolicyClient'

export default async function PoliciesPage() {
  const policies = await prisma.policy.findMany({
    include: { agent: true }
  })

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Policies</h2>
          <p className="text-muted-foreground mt-1">
            Global constraints for all agents operating in your organization.
          </p>
        </div>
      </header>

      <div className="space-y-4 max-w-4xl">
        {policies.map((policy) => (
          <Card key={policy.id} className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500/10 text-green-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{policy.agent?.name} Limits</h3>
                  <div className="text-sm text-muted-foreground flex gap-4 mt-1">
                    <span>Target: {policy.agent?.name}</span>
                    <span className="text-white/20">•</span>
                    <span>Status: Enforced</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-sm">
                  <div className="text-muted-foreground mb-1">Constraints</div>
                  <ul className="space-y-1">
                    <li>Max Tx: ₹{policy.transactionLimit.toLocaleString()}</li>
                    <li>Daily: ₹{policy.dailyLimit.toLocaleString()}</li>
                    <li>Approval Req &gt; ₹{policy.approvalThreshold.toLocaleString()}</li>
                  </ul>
                </div>
                <EditPolicyClient 
                  policyId={policy.id} 
                  currentTransactionLimit={policy.transactionLimit} 
                  currentDailyLimit={policy.dailyLimit} 
                  currentApprovalThreshold={policy.approvalThreshold} 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
