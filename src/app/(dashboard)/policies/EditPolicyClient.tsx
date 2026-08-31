'use client'

import { useState } from 'react'
import { updatePolicy } from '@/app/actions/policies'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Edit2 } from "lucide-react"

export default function EditPolicyClient({ 
  policyId, 
  currentTransactionLimit, 
  currentDailyLimit, 
  currentApprovalThreshold 
}: { 
  policyId: string, 
  currentTransactionLimit: number, 
  currentDailyLimit: number, 
  currentApprovalThreshold: number 
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [txLimit, setTxLimit] = useState(currentTransactionLimit)
  const [dailyLimit, setDailyLimit] = useState(currentDailyLimit)
  const [approvalThreshold, setApprovalThreshold] = useState(currentApprovalThreshold)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updatePolicy(policyId, {
        transactionLimit: txLimit,
        dailyLimit,
        approvalThreshold
      })
      setOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-white" />}>
        <Edit2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Edit Agent Policy Limits</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="txLimit">Hard Transaction Limit (₹)</Label>
            <Input id="txLimit" type="number" value={txLimit} onChange={e => setTxLimit(Number(e.target.value))} required className="bg-background/50" />
            <p className="text-xs text-muted-foreground">Transactions above this are hard blocked.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dailyLimit">Daily Spending Limit (₹)</Label>
            <Input id="dailyLimit" type="number" value={dailyLimit} onChange={e => setDailyLimit(Number(e.target.value))} required className="bg-background/50" />
            <p className="text-xs text-muted-foreground">Maximum total spend per day.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="approvalThreshold">Approval Threshold (₹)</Label>
            <Input id="approvalThreshold" type="number" value={approvalThreshold} onChange={e => setApprovalThreshold(Number(e.target.value))} required className="bg-background/50" />
            <p className="text-xs text-muted-foreground">Transactions above this require human approval.</p>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? 'Saving...' : 'Save Policy'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
