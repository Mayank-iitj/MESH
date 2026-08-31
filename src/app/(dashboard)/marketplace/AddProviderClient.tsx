'use client'

import { useState } from 'react'
import { createProvider } from '@/app/actions/providers'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function AddProviderClient() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState(100)
  const [riskScore, setRiskScore] = useState(10)
  const [verified, setVerified] = useState(false)
  const [rails, setRails] = useState(['LIGHTNING'])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await createProvider({
        name,
        category,
        price,
        riskScore,
        verified,
        upiEnabled: rails.includes('UPI'),
        lightningEnabled: rails.includes('LIGHTNING')
      })
      setOpen(false)
      setName('')
      setCategory('')
      setPrice(100)
      setRiskScore(10)
      setVerified(false)
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
        <Plus className="w-4 h-4 mr-2" />
        Add Provider
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add Provider to Marketplace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Provider Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Acme Inference" className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={category} onChange={e => setCategory(e.target.value)} required placeholder="e.g. Compute" className="bg-background/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskScore">Risk Score</Label>
              <Input id="riskScore" type="number" max={100} min={0} value={riskScore} onChange={e => setRiskScore(Number(e.target.value))} required className="bg-background/50" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="verified" checked={verified} onCheckedChange={(checked) => setVerified(checked === true)} />
              <Label htmlFor="verified" className="font-normal">KYB Verified Provider</Label>
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <Label>Supported Settlement Rails</Label>
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
              {isLoading ? 'Adding...' : 'Add Provider'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
