import { NextRequest, NextResponse } from "next/server";
import { llmGenerate } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { merchant, amount, category, policyMarkdown, lang } = (await req.json()) as {
      merchant: string;
      amount: string;
      category: string;
      policyMarkdown?: string;
      lang?: string;
    };
    if (!merchant || !amount) return NextResponse.json({ error: "merchant and amount required" }, { status: 400 });

    const prompt = `You are a refund specialist. Write a persuasive refund email for:
Merchant: ${merchant}
Amount: ${amount}
Category: ${category}
Policy excerpt: ${(policyMarkdown || "").slice(0, 2000)}
Language: ${lang || "en+zh"}

Requirements:
- Cite the policy window (e.g., "within 14 days")
- Mention unused service / goodwill
- Keep one version English formal, one Chinese.
- Provide subject, body, chat script.
- Be concise, polite, firm, mention chargeback as last resort lightly.
Return ONLY JSON: {"subject":"","body":"","chatScript":"","subjectZh":"","bodyZh":""}`;

    const llm = await llmGenerate(prompt, "generate");
    if (llm) {
      try {
        const m = llm.text.match(/\{[\s\S]*\}/);
        if (m) {
          const parsed = JSON.parse(m[0]);
          return NextResponse.json({ ...parsed, engine: llm.engine, model: llm.model });
        }
      } catch {}
      // fallback: treat whole text as body
      return NextResponse.json({ subject: `Refund request - ${merchant}`, body: llm.text, chatScript: llm.text.slice(0,200), subjectZh: `申请退款 - ${merchant}`, bodyZh: llm.text, engine: llm.engine });
    }

    return NextResponse.json({ error: "No LLM key configured. Add GEMINI_API_KEY or OPENAI_API_KEY to .env.local. Using rule template fallback.", fallback: true }, { status: 503 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
