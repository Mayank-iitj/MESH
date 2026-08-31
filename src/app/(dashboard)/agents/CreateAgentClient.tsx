'use client'

import { useState } from 'react'
import { createAgent } from '@/app/actions/agents'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

export default function CreateAgentClient() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [name, setName] = useState('')
  const [purpose, setPurpose] = useState('')
  const [funding, setFunding] = useState(1000)
  const [limit, setLimit] = useState(250)
  const [rails, setRails] = useState(['LIGHTNING'])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await createAgent({
        name,
        purpose,
        initialFunding: funding,
        transactionLimit: limit,
        allowedRails: rails
      })
      setOpen(false)
      // reset form
      setName('')
      setPurpose('')
      setFunding(1000)
      setLimit(250)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRail = (rail: string) => {
    setRails(prev => 
      prev.includes(rail) ? prev.filter(r => r !== rail) : [...prev, rail]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700 text-white" />}>
        Provision New Agent
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Provision New Agent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Agent Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Marketing Copilot" className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input id="purpose" value={purpose} onChange={e => setPurpose(e.target.value)} required placeholder="e.g. Ad-hoc campaign spending" className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="funding">Initial Funding (₹)</Label>
            <Input id="funding" type="number" value={funding} onChange={e => setFunding(Number(e.target.value))} required className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit">Hard Transaction Limit (₹)</Label>
            <Input id="limit" type="number" value={limit} onChange={e => setLimit(Number(e.target.value))} required className="bg-background/50" />
          </div>
          <div className="space-y-2 pt-2">
            <Label>Allowed Settlement Rails</Label>
            <div className="flex gap-4 pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="lightning" checked={rails.includes('LIGHTNING')} onCheckedChange={() => toggleRail('LIGHTNING')} />
                <Label htmlFor="lightning" className="font-normal">⚡ Lightning</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="upi" checked={rails.includes('UPI')} onCheckedChange={() => toggleRail('UPI')} />
                <Label htmlFor="upi" className="font-normal">🏦 UPI</Label>
              </div>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? 'Provisioning...' : 'Provision Agent'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
