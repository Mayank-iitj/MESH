'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Store, Star, HardDrive, Cpu, BrainCircuit, Banknote, ShieldCheck, Zap } from "lucide-react"
import { createProvider } from '@/app/actions/providers'
import AddProviderClient from './AddProviderClient'
import { toast } from 'sonner' // Assuming they have sonner, if not we just don't toast, or we use alert. wait, shadcn usually has toast. I'll use standard browser alert for safety if sonner isn't guaranteed, but wait, `lucide-react` is there.

// We will simulate a toast or just let the revalidation update the UI natively.

type Provider = {
  id: string;
  name: string;
  category: string;
  price: number;
  riskScore: number;
  verified: boolean;
  upiEnabled: boolean;
  lightningEnabled: boolean;
  rating: number;
  availability: number;
}

const MOCK_CATALOG = [
  { name: 'RenderForge', category: 'Compute', price: 85, riskScore: 5, verified: true, upiEnabled: true, lightningEnabled: true, rating: 4.9, availability: 99.99 },
  { name: 'Anthropic Core', category: 'Inference', price: 400, riskScore: 10, verified: true, upiEnabled: true, lightningEnabled: false, rating: 4.8, availability: 99.95 },
  { name: 'AWS S3 Ultra', category: 'Storage', price: 15, riskScore: 2, verified: true, upiEnabled: false, lightningEnabled: false, rating: 4.9, availability: 99.99 },
  { name: 'Stripe API', category: 'Finance', price: 0, riskScore: 5, verified: true, upiEnabled: true, lightningEnabled: false, rating: 4.9, availability: 99.99 },
  { name: 'DeepMind Alpha', category: 'Inference', price: 750, riskScore: 15, verified: true, upiEnabled: false, lightningEnabled: true, rating: 4.7, availability: 99.90 },
  { name: 'HuggingFace Hub', category: 'Tools', price: 50, riskScore: 8, verified: true, upiEnabled: false, lightningEnabled: false, rating: 4.6, availability: 99.50 },
  { name: 'Pinecone VectorDB', category: 'Storage', price: 120, riskScore: 4, verified: true, upiEnabled: true, lightningEnabled: false, rating: 4.8, availability: 99.99 },
  { name: 'GCP Tensor', category: 'Compute', price: 250, riskScore: 3, verified: true, upiEnabled: true, lightningEnabled: false, rating: 4.9, availability: 99.98 },
]

const getIconForCategory = (category: string) => {
  switch (category.toLowerCase()) {
    case 'compute': return <Cpu className="w-6 h-6 text-blue-400" />
    case 'storage': return <HardDrive className="w-6 h-6 text-green-400" />
    case 'inference': return <BrainCircuit className="w-6 h-6 text-purple-400" />
    case 'finance': return <Banknote className="w-6 h-6 text-yellow-400" />
    default: return <Store className="w-6 h-6 text-gray-400" />
  }
}

export default function MarketplaceClient({ installedProviders }: { installedProviders: Provider[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [installing, setInstalling] = useState<string | null>(null)

  const categories = ['All', 'Compute', 'Inference', 'Storage', 'Finance', 'Tools']

  // Combine DB installed providers and our mock catalog
  const installedNames = new Set(installedProviders.map(p => p.name))
  
  const allProviders = [
    ...installedProviders.map(p => ({ ...p, isInstalled: true })),
    ...MOCK_CATALOG.filter(m => !installedNames.has(m.name)).map(m => ({ ...m, id: `mock-${m.name}`, isInstalled: false }))
  ]

  const filteredProviders = allProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) || provider.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'All' || provider.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const handleInstall = async (provider: typeof MOCK_CATALOG[0]) => {
    setInstalling(provider.name)
    try {
      await createProvider({
        name: provider.name,
        category: provider.category,
        price: provider.price,
        riskScore: provider.riskScore,
        verified: provider.verified,
        upiEnabled: provider.upiEnabled,
        lightningEnabled: provider.lightningEnabled
      })
    } catch (error) {
      console.error(error)
    } finally {
      setInstalling(null)
    }
  }

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <header className="mb-8 flex items-end justify-between border-b border-border/50 pb-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-2">Marketplace</h2>
          <p className="text-muted-foreground text-lg">
            Discover and install pre-configured integrations and autonomous capabilities.
          </p>
        </div>
        <AddProviderClient />
      </header>

      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full lg:w-auto scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Search providers, capabilities, APIs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/40 border-border/50 rounded-full w-full"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProviders.map((provider) => (
          <Card key={provider.id} className="bg-card/40 border-border/50 flex flex-col hover:bg-card/80 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 group">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {getIconForCategory(provider.category)}
                </div>
                {provider.verified && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl">{provider.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span>{provider.category}</span>
                <span>•</span>
                <span className="text-white font-medium">₹{provider.price}/req</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-white">{provider.rating}</span>
                </div>
                <div className="text-muted-foreground font-mono text-xs">{provider.availability}% Uptime</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Rails</div>
                <div className="flex gap-2">
                  {provider.upiEnabled && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">UPI</Badge>
                  )}
                  {provider.lightningEnabled && (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs">
                      <Zap className="w-3 h-3 mr-1" /> Lightning
                    </Badge>
                  )}
                  {!provider.upiEnabled && !provider.lightningEnabled && (
                    <span className="text-xs text-muted-foreground">Standard</span>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-white/5">
              {provider.isInstalled ? (
                <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white cursor-default hover:bg-white/5" disabled>
                  Installed
                </Button>
              ) : (
                <Button 
                  onClick={() => handleInstall(provider as any)} 
                  disabled={installing === provider.name}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all"
                >
                  {installing === provider.name ? 'Installing...' : 'Install'}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
