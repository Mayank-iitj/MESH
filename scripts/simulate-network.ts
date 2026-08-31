import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load env vars
config()

const prisma = new PrismaClient()

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function simulateNetwork() {
  console.log("🚀 Starting Global Autonomous Network Simulator...")
  console.log("Connects to Minimax to generate live traffic for all ACTIVE agents.")
  
  while (true) {
    try {
      // 1. Find all active agents
      const activeAgents = await prisma.agent.findMany({
        where: { status: 'ACTIVE' },
        include: { policy: true }
      })
      
      if (activeAgents.length === 0) {
        console.log("No active agents found. Sleeping...")
        await sleep(5000)
        continue
      }
      
      // Select a random agent to execute a task
      const agent = activeAgents[Math.floor(Math.random() * activeAgents.length)]
      
      console.log(`\n======================================`)
      console.log(`🤖 Agent Selected: ${agent.name}`)
      console.log(`🎯 Purpose: ${agent.purpose}`)
      console.log(`🧠 Querying Minimax for next autonomous action...`)
      
      // Generate Intent (We simulate what the Server Action does)
      const providers = await prisma.provider.findMany({ select: { category: true }, distinct: ['category'] })
      const availableCategories = providers.map(p => p.category)
      
      const prompt = `You are the "brain" for an autonomous AI agent in a corporate network.
Your name is: ${agent.name}
Your purpose/role is: ${agent.purpose}

Your job is to generate a realistic next task that you want to accomplish, based on your role.
You must select a task that fits into one of the following available service categories:
${JSON.stringify(availableCategories)}

Your current policy limits allow you to spend up to ₹${agent.policy?.transactionLimit || 500} per transaction.

Provide your desired task as a JSON object with exactly these fields:
- description: A realistic, 1-sentence explanation of what you are trying to buy/do
- budget: A realistic number in INR (e.g. 350)
- category: The EXACT string from the available categories list above that matches this task.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "minimax/minimax-m3:free",
          messages: [
            { role: "system", content: "You are a JSON-only AI agent brain. Always return valid JSON." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0]) {
        throw new Error("Invalid response from Minimax API")
      }
      const resultText = data.choices[0].message.content;
      const cleanJson = resultText.replace(/```json\n?/g, '').replace(/```/g, '').trim();
      const intent = JSON.parse(cleanJson);

      console.log(`💡 Intent Generated:`)
      console.log(`   - Task: "${intent.description}"`)
      console.log(`   - Budget: ₹${intent.budget}`)
      console.log(`   - Category: ${intent.category}`)
      
      // Hit the public MESH API to actually execute it
      // First, get an API key
      let apiKeyRecord = await prisma.apiKey.findFirst({
        where: { userId: agent.userId }
      })
      
      if (!apiKeyRecord) {
        console.log(`⚠️ Agent owner has no API keys. Auto-generating one for simulation...`)
        apiKeyRecord = await prisma.apiKey.create({
          data: {
            userId: agent.userId,
            name: 'Simulator Key',
            key: 'sim_' + Math.random().toString(36).substring(2, 15)
          }
        })
      }

      console.log(`⚡ Dispatching to MESH Policy Engine API...`)
        
        // We'll use the Vercel checkout API or fallback to env var
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://meshcontrolplane.vercel.app"
        const apiResponse = await fetch(`${apiUrl}/api/v1/checkout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKeyRecord.key}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            agentId: agent.id,
            amount: intent.budget,
            category: intent.category,
            description: intent.description
          })
        })
        
        const apiResult = await apiResponse.json()
        
        if (apiResponse.ok) {
          console.log(`✅ Transaction settled: ${apiResult.transactionId}`)
        } else {
          console.log(`❌ Engine Rejected: ${apiResult.error || 'Blocked by policy'}`)
        }
      
      // Wait a random amount of time before the next agent fires
      const delay = Math.floor(Math.random() * 5000) + 3000
      console.log(`Waiting ${delay}ms before next global network event...`)
      await sleep(delay)
      
    } catch (e: any) {
      console.error(`Error in simulation loop: ${e.message}`)
      await sleep(5000)
    }
  }
}

simulateNetwork()
