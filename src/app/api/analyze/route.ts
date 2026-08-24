import { NextRequest, NextResponse } from "next/server";
import { analyzeRefund } from "@/lib/refund-engine";
import { generateTemplates } from "@/lib/templates";
import { llmFindProblem, llmDiscoverWithQueries } from "@/lib/llm-refund";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, fileName } = body as { text: string; fileName?: string };
    if (!text && !fileName) {
      return NextResponse.json({ error: "No input" }, { status: 400 });
    }

    // LLM-first：先让模型找问题（不依赖119固定库）
    const problem = await llmFindProblem(text || "", fileName);
    // 传统规则也跑一次，做对比/兜底
    const ruleAnalysis = analyzeRefund(text || "", fileName);

    // 以LLM的merchant/category为准，覆盖规则
    const analysis = {
      ...ruleAnalysis,
      ocr: { ...ruleAnalysis.ocr, merchant: problem.merchant, amount: problem.amount, currency: problem.currency, date: problem.date, orderId: problem.orderId },
      category: problem.category as typeof ruleAnalysis.category,
      reason: problem.reason,
      reasonEn: problem.reason,
      score: problem.confidence,
      details: [...ruleAnalysis.details, `LLM: ${problem.searchQueries.join(" | ")}`],
    };

    // LLM驱动的政策发现（119只当缓存）
    const discovered = await llmDiscoverWithQueries(problem);
    const tpl = generateTemplates(analysis as never);

    return NextResponse.json({
      analysis,
      tpl,
      problem, // 暴露给前端调试
      discovered: discovered ? { url: discovered.url, engine: discovered.engine, markdownLen: discovered.markdown.length } : null,
      mode: "llm-first",
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
