'use client'

import { useState, useEffect, useRef } from 'react'
import { executeAgentTask } from '@/app/actions/engine'
import { generateAgentIntent } from '@/app/actions/generator'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BrainCircuit, ShieldCheck, Zap, ArrowRight, CheckCircle2, XCircle } from "lucide-react"

type DemoState = 'idle' | 'agent' | 'policy' | 'provider' | 'complete' | 'error'

export default function DemoRunner({ agentId }: { agentId: string }) {
  const [logs, setLogs] = useState<{ text: string; time: string; type: 'info' | 'success' | 'error' }[]>([])
  const [step, setStep] = useState<DemoState>('idle')
  const logsEndRef = useRef<HTMLDivElement>(null)

  const addLog = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { text, time: new Date().toLocaleTimeString(), type }])
  }

  const runDemo = async () => {
    setStep('idle')
    setLogs([])
    
    // Step 1: Agent Initiation
    setStep('agent')
    addLog('Initiating Autonomous Commerce Demo...', 'info')
    await new Promise(r => setTimeout(r, 800))
    addLog('Querying Agent Brain (Minimax) for next task...', 'info')
    
    try {
      const intent = await generateAgentIntent(agentId)
      
      addLog(`Agent Goal: "${intent.description}"`, 'success')
      addLog(`Budget Set: ₹${intent.budget} | Target Category: ${intent.category}`, 'info')
      await new Promise(r => setTimeout(r, 800))
      
      // Step 2: Policy Evaluation
      setStep('policy')
      addLog('Routing request to MESH Policy Engine.', 'info')
      await new Promise(r => setTimeout(r, 800))
      addLog('Evaluating against organizational constraints...', 'info')
      
      // Step 3 & 4: Provider & Execution
      // We call the real backend engine here with the LLM-generated intent
      const result = await executeAgentTask(
        agentId, 
        intent.description, 
        intent.budget, 
        intent.category
      )
      
      setStep('provider')
      if (result.log) {
        // Stream the logs back from the server result
        for (const logLine of result.log) {
          addLog(logLine, 'info')
          await new Promise(r => setTimeout(r, 400))
        }
      }
      
      if (result.success) {
        setStep('complete')
        addLog('✓ Transaction settled successfully on Lightning Network.', 'success')
      } else {
        setStep('error')
        addLog('✕ Transaction blocked by policy engine.', 'error')
      }
    } catch (error: any) {
      setStep('error')
      addLog(`Error: ${error.message}`, 'error')
    }
  }

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Helper for node styling
  const getNodeClass = (nodeStep: DemoState, activeSteps: DemoState[]) => {
    if (activeSteps.includes(step) || step === 'complete') {
      return "bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110"
    }
    if (step === 'error') {
      return "bg-red-500/20 border-red-500 text-red-400"
    }
    return "bg-card border-border/50 text-muted-foreground opacity-50"
  }

  const getLineClass = (activeSteps: DemoState[]) => {
    if (activeSteps.includes(step) || step === 'complete') {
      return "border-blue-500/50 bg-blue-500/50 animate-pulse"
    }
    if (step === 'error') {
      return "border-red-500/30 bg-red-500/30"
    }
    return "border-border/30 bg-border/30"
  }

  return (
    <Card className="bg-card/40 border-border/50 col-span-full overflow-hidden backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between bg-black/20 border-b border-border/30 pb-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Autonomous Commerce Demo
          </CardTitle>
          <CardDescription className="mt-1">
            Watch real-time execution as the agent evaluates providers, checks policy, and routes payment.
          </CardDescription>
        </div>
        <Button 
          onClick={runDemo} 
          disabled={step !== 'idle' && step !== 'complete' && step !== 'error' || !agentId}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all"
        >
          {step === 'idle' || step === 'complete' || step === 'error' ? 'Run Demo' : 'Executing...'}
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/30">
          
          {/* Visual Graph Side */}
          <div className="p-8 flex flex-col items-center justify-center min-h-[300px] relative bg-gradient-to-br from-blue-900/5 to-purple-900/5">
            <div className="flex items-center justify-between w-full max-w-md relative z-10">
              
              {/* Agent Node */}
              <div className="flex flex-col items-center gap-3 z-10">
                <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${getNodeClass('agent', ['agent', 'policy', 'provider'])}`}>
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <span className="text-sm font-medium tracking-wide">Agent</span>
              </div>

              {/* Line 1 */}
              <div className={`flex-1 h-1 mx-2 transition-all duration-500 ${getLineClass(['policy', 'provider'])}`} />

              {/* Policy Node */}
              <div className="flex flex-col items-center gap-3 z-10">
                <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${getNodeClass('policy', ['policy', 'provider'])}`}>
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <span className="text-sm font-medium tracking-wide">Policy</span>
              </div>

              {/* Line 2 */}
              <div className={`flex-1 h-1 mx-2 transition-all duration-500 ${getLineClass(['provider'])}`} />

              {/* Provider Node */}
              <div className="flex flex-col items-center gap-3 z-10">
                <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${getNodeClass('provider', ['provider'])}`}>
                  <Zap className="w-8 h-8" />
                </div>
                <span className="text-sm font-medium tracking-wide">Provider</span>
              </div>

            </div>

            {/* Status Indicator */}
            <div className="absolute bottom-6 flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/5 backdrop-blur-md">
              {step === 'idle' && <span className="text-xs text-muted-foreground">Ready to simulate</span>}
              {step === 'agent' && <><div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" /><span className="text-xs text-blue-400">Agent analyzing request...</span></>}
              {step === 'policy' && <><div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" /><span className="text-xs text-blue-400">Checking organizational limits...</span></>}
              {step === 'provider' && <><div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" /><span className="text-xs text-blue-400">Negotiating & Settling...</span></>}
              {step === 'complete' && <><CheckCircle2 className="w-4 h-4 text-green-400" /><span className="text-xs text-green-400">Execution successful</span></>}
              {step === 'error' && <><XCircle className="w-4 h-4 text-red-400" /><span className="text-xs text-red-400">Execution halted</span></>}
            </div>
          </div>

          {/* Terminal Logs Side */}
          <div className="bg-[#0a0a0a] p-6 h-[350px] font-mono text-sm overflow-y-auto scanline-effect relative flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-muted-foreground border-b border-border/30 pb-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <span className="ml-2 text-xs opacity-50">mesh-execution-engine (v1.4.2)</span>
            </div>
            
            <div className="flex-1 flex flex-col gap-2">
              {logs.length === 0 ? (
                <span className="text-muted-foreground/50 italic">&gt; Waiting for command...</span>
              ) : (
                logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-start gap-3 ${
                      log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-blue-200'
                    }`} 
                    style={{ animationFillMode: 'forwards' }}
                  >
                    <span className="text-muted-foreground/40 shrink-0">[{log.time}]</span>
                    <span className="break-all">{log.text}</span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
