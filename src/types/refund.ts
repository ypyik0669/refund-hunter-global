export type RefundCategory =
  | "duplicate"
  | "renewal"
  | "price_drop"
  | "overcharge"
  | "warranty"
  | "other";

export interface OcrResult {
  merchant: string;
  amount: string;
  currency: string;
  date: string;
  orderId: string;
  rawText: string;
}

export interface RefundAnalysis {
  id: string;
  category: RefundCategory;
  score: number; // 0-100
  label: "high" | "likely" | "medium" | "low";
  labelText: string;
  color: string;
  reason: string;
  reasonEn: string;
  details: string[];
  refundable: boolean;
  estimatedRefund: string;
  ocr: OcrResult;
}

export interface RefundTemplate {
  subject: string;
  body: string;
  chatScript: string;
  subjectZh?: string;
  bodyZh?: string;
}
