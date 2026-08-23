import { NextRequest, NextResponse } from "next/server";
import { analyzeRefund } from "@/lib/refund-engine";
import { generateTemplates } from "@/lib/templates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, fileName } = body as { text: string; fileName?: string };
    if (!text && !fileName) {
      return NextResponse.json({ error: "No input" }, { status: 400 });
    }
    const analysis = analyzeRefund(text || "", fileName);
    const tpl = generateTemplates(analysis);
    // In production, call Claude Vision here:
    // const ocr = await claudeVision(file)
    // const analysis = await analyzeWithClaude(ocr.text)
    return NextResponse.json({ analysis, tpl });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
