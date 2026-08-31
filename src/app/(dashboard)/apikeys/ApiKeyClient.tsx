'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Key, Copy, Check, Trash2, Shield, Eye, EyeOff } from "lucide-react"
import { createApiKey, deleteApiKey } from '@/app/actions/apikeys'
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type ApiKey = {
  id: string;
  key: string;
  name: string;
  createdAt: Date;
  lastUsed: Date | null;
}

export default function ApiKeyClient({ apiKeys }: { apiKeys: ApiKey[] }) {
  const [newKeyName, setNewKeyName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState(false)
  const [freshKey, setFreshKey] = useState<string | null>(null)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) return
    
    setIsGenerating(true)
    try {
      const key = await createApiKey(newKeyName)
      setFreshKey(key.key)
      setNewKeyName('')
      // Keep dialog open to show the fresh key
    } catch (error) {
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleVisibility = (id: string) => {
    const next = new Set(visibleKeys)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setVisibleKeys(next)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-card/40 border border-border/50 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold">API Keys</h3>
          <p className="text-muted-foreground mt-1 text-sm max-w-lg">
            Use these keys to authenticate your external AI agents with the MESH Policy Engine and Payment Router.
          </p>
        </div>
        
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val)
          if (!val) setFreshKey(null) // Reset on close
        }}>
          {/* @ts-expect-error asChild type issue */}
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <Key className="w-4 h-4 mr-2" />
              Create Secret Key
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create new secret key</DialogTitle>
            </DialogHeader>
            
            {freshKey ? (
              <div className="space-y-4 pt-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3">
                  <Shield className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-500">
                    Please copy this secret key and store it somewhere safe. For security reasons, <strong>you won't be able to view it again</strong> through your MESH account.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Input readOnly value={freshKey} className="font-mono bg-background/50 text-blue-400" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(freshKey, 'fresh')}>
                    {copiedId === 'fresh' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <Button className="w-full mt-4" onClick={() => { setOpen(false); setFreshKey(null); }}>
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="e.g. Local Trading Agent" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} required autoFocus className="bg-background/50" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isGenerating || !newKeyName.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isGenerating ? 'Generating...' : 'Create secret key'}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-background/50 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Secret Key</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium">Last Used</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {apiKeys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No API keys found. Create one to get started.
                  </td>
                </tr>
              ) : (
                apiKeys.map((apiKey) => {
                  const isVisible = visibleKeys.has(apiKey.id)
                  // Show only first 8 chars, rest masked, unless "visible" (but realistically, we shouldn't show it again. For MVP we can just mask it like sk_mesh_***...***)
                  const prefix = apiKey.key.substring(0, 12)
                  const suffix = apiKey.key.substring(apiKey.key.length - 4)
                  const maskedKey = `${prefix}${'•'.repeat(24)}${suffix}`

                  return (
                    <tr key={apiKey.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{apiKey.name}</td>
                      <td className="px-6 py-4 font-mono text-muted-foreground flex items-center gap-2">
                        {maskedKey}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(apiKey.createdAt, "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {apiKey.lastUsed ? format(apiKey.lastUsed, "MMM d, yyyy") : 'Never'}
                      </td>
                      <td className="px-6 py-4 flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => deleteApiKey(apiKey.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
