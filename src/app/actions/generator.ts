'use server'

import { prisma } from '@/lib/prisma'

export async function generateAgentIntent(agentId: string) {
  // Fetch the agent and available provider categories
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { policy: true }
  })

  if (!agent) {
    throw new Error("Agent not found")
  }

  // Get distinct categories from providers so the LLM actually picks a valid one
  const providers = await prisma.provider.findMany({
    select: { category: true },
    distinct: ['category']
  })
  const availableCategories = providers.map(p => p.category)

  const prompt = `You are the "brain" for an autonomous AI agent in a corporate network.
Your name is: ${agent.name}
Your purpose/role is: ${agent.purpose}

Your job is to generate a realistic next task that you want to accomplish, based on your role.
You must select a task that fits into one of the following available service categories:
${JSON.stringify(availableCategories)}

Your current policy limits allow you to spend up to ₹${agent.policy?.transactionLimit || 500} per transaction.

Provide your desired task as a JSON object with exactly these fields:
- description: A realistic, 1-sentence explanation of what you are trying to buy/do (e.g. "I need to purchase cloud compute credits for training my new model.")
- budget: A realistic number in INR (e.g. 350)
- category: The EXACT string from the available categories list above that matches this task.`;

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
          { role: "system", content: "You are a JSON-only AI agent brain. Always return valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error("Invalid response from Minimax API");
    }
    const resultText = data.choices[0].message.content;
    const cleanJson = resultText.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanJson);

    // Validate the category against our available list
    let finalCategory = result.category;
    if (!availableCategories.includes(finalCategory)) {
      finalCategory = availableCategories[0] || 'Compute'; // fallback
    }

    return {
      description: result.description || `Autonomously acting on role: ${agent.purpose}`,
      budget: typeof result.budget === 'number' ? result.budget : 200,
      category: finalCategory
    };
  } catch (error) {
    console.error("Agent generation failed, falling back to heuristic task:", error);
    // Fallback if the API fails
    return {
      description: `Fallback autonomous task for ${agent.name} (${agent.purpose})`,
      budget: 150,
      category: availableCategories[0] || 'Compute'
    };
  }
}
