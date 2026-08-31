'use client'

import { useState, useRef, useEffect } from 'react'
import { interactWithAgent } from '@/app/actions/chat'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, User, BrainCircuit } from 'lucide-react'

type Message = { role: 'user' | 'ai', content: string }

export default function AgentChatClient({ agentId, agentName }: { agentId: string, agentName: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: `Hello. I am ${agentName}. How can I assist you today?` }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMessage = input
    setInput('')
    
    // Add user message to state
    const newHistory = [...messages, { role: 'user' as const, content: userMessage }]
    setMessages(newHistory)
    setIsTyping(true)
    
    try {
      const response = await interactWithAgent(agentId, userMessage, messages.slice(-10)) // send last 10 messages for context
      setMessages([...newHistory, { role: 'ai', content: response }])
    } catch (error) {
      setMessages([...newHistory, { role: 'ai', content: "Error connecting to AI core." }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <Card className="h-full flex flex-col bg-card/40 border-border/50 backdrop-blur-sm overflow-hidden shadow-2xl">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 max-w-[80%] items-start ${msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto'}`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <BrainCircuit className="w-4 h-4 text-blue-400" />
              </div>
            )}
            
            <div className={`p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-muted/50 border border-border text-foreground rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
            </div>
            
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-start">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-4 h-4 text-blue-400" />
            </div>
            <div className="p-4 rounded-2xl bg-muted/50 border border-border rounded-tl-none flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-blue-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-blue-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      
      <div className="p-4 border-t border-border/50 bg-black/20">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Instruct your agent..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            disabled={isTyping}
          />
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="rounded-full w-12 h-12 p-0 bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.4)] shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
