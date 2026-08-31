'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Send } from "lucide-react"

export default function AIInterrogationModal({ transactionId, initialReason }: { transactionId: string, initialReason: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([
    { role: 'ai', text: `Transaction #${transactionId} was BLOCKED.\nReason: ${initialReason}\n\nDo you have questions about this decision?` }
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = input
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')
    
    // Simulate AI response for the hackathon
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: `Based on the agent's policy limits and the provider's risk score, allowing this transaction would violate organizational constraints. Specifically, the dynamic risk engine flagged the provider category as potentially fraudulent.` 
      }])
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" className="w-full text-xs" />}>
        <ShieldAlert className="w-4 h-4 mr-2" />
        Interrogate AI
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-black/90 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <DialogHeader>
          <DialogTitle className="text-red-400 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            AI Policy Interrogation
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-[300px]">
          <div className="flex-1 overflow-y-auto space-y-4 p-4 font-mono text-sm border border-white/5 rounded-lg bg-black/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  m.role === 'user' 
                    ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30' 
                    : 'bg-red-900/20 text-red-200 border border-red-500/30'
                }`}>
                  <div className="text-[10px] uppercase opacity-50 mb-1">{m.role === 'user' ? 'Admin' : 'MESH AI'}</div>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask why this was blocked..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
            />
            <Button onClick={handleSend} size="icon" className="bg-red-600 hover:bg-red-700 text-white shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
