import { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Real LLM Risk Evaluation Engine using OpenRouter and Minimax.
 */
export async function evaluateRisk(transactionParams: { 
  amount: number; 
  providerName: string;
  providerRiskScore: number;
}, policy: { 
  transactionLimit: number;
  dailyLimit: number;
}) {
  const { amount, providerRiskScore, providerName } = transactionParams;
  const { transactionLimit, dailyLimit } = policy;

  const prompt = `You are an AI risk evaluation engine for an autonomous agent platform called MESH.
Your job is to evaluate a proposed transaction and determine its risk score (0-100) and whether it should be ALLOWED or BLOCKED.

Transaction Details:
- Amount: ₹${amount}
- Provider: ${providerName}
- Provider Baseline Risk Score: ${providerRiskScore}/100

Agent Policy Limits:
- Hard Transaction Limit: ₹${transactionLimit}
- Daily Budget Limit: ₹${dailyLimit}

Rules:
1. If the amount exceeds the Hard Transaction Limit, it MUST be BLOCKED and the risk score should be 90-100.
2. If the Provider Baseline Risk Score is high (>50), consider increasing the final risk score.
3. If the transaction looks safe, keep the risk score low and ALLOW it.

Provide your evaluation as a JSON object with exactly these fields:
- riskScore: a number from 0 to 100
- reasoning: a short 1-2 sentence explanation of your decision
- recommendedAction: exactly "ALLOW" or "BLOCK"`;

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
          { role: "system", content: "You are a JSON-only AI risk engine. Always return valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const result = JSON.parse(resultText);

    return {
      riskScore: typeof result.riskScore === 'number' ? result.riskScore : 50,
      reasoning: result.reasoning || "AI evaluation completed.",
      recommendedAction: result.recommendedAction === 'BLOCK' ? 'BLOCK' : 'ALLOW'
    };
  } catch (error) {
    console.error("AI Evaluation failed, falling back to heuristics:", error);
    // Fallback logic if the API fails
    let riskScore = 10;
    let reasoning = `Fallback: Transaction to ${providerName} appears safe.`;
    let blocked = false;

    if (amount > transactionLimit) {
      riskScore = 95;
      reasoning = `Fallback: Amount ₹${amount} exceeds the hard transaction limit of ₹${transactionLimit}.`;
      blocked = true;
    } else if (providerRiskScore > 50) {
      riskScore = providerRiskScore + 10;
      reasoning = `Fallback: Provider ${providerName} has a high baseline risk score.`;
      if (riskScore > 75) blocked = true;
    }

    return {
      riskScore,
      reasoning,
      recommendedAction: blocked ? 'BLOCK' : 'ALLOW'
    };
  }
}
