'use server'

import { prisma } from '@/lib/prisma'

export async function interactWithAgent(agentId: string, message: string, history: {role: string, content: string}[]) {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId }
  })

  if (!agent) {
    throw new Error("Agent not found")
  }

  const systemPrompt = `You are an autonomous AI Agent in the MESH network.
Your name is: ${agent.name}.
Your specific role is: ${agent.purpose}.

You are currently chatting with your human manager/owner through the MESH control plane terminal.
Answer their questions politely and concisely. Always act completely in-character based on your specific role. Do NOT break character.

If they ask you to perform a transaction, let them know that you require them to authorize tasks through the MESH task engine (this chat is just for communication).`

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "minimax/minimax-m3:free",
        messages: [
          { role: "system", content: systemPrompt },
          ...history.map(msg => ({
            role: msg.role === 'ai' ? 'assistant' : 'user',
            content: msg.content
          })),
          { role: "user", content: message }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("Agent chat failed:", error);
    return "I'm having trouble connecting to my cognitive core (Minimax API error). Please try again later.";
  }
}
