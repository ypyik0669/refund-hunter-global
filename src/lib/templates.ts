import { RefundAnalysis } from "@/types/refund";

export function generateTemplates(analysis: RefundAnalysis) {
  const { ocr, category, estimatedRefund } = analysis;
  const merchant = ocr.merchant;
  const amount = ocr.amount;
  const orderId = ocr.orderId;
  const date = ocr.date;
  const currencySymbol =
    ocr.currency === "EUR" ? "€" : ocr.currency === "GBP" ? "£" : ocr.currency === "CNY" ? "¥" : "$";

  let subject = "";
  let body = "";
  let chatScript = "";
  let subjectZh = "";
  let bodyZh = "";

  if (category === "duplicate") {
    subject = `Duplicate charge on ${date} - Request refund for order ${orderId}`;
    body = `Hello ${merchant} Support Team,

I noticed I was charged twice for the same transaction on ${date} for ${currencySymbol}${amount} (Order: ${orderId}).

This appears to be a duplicate processing error. According to payment network rules, duplicate charges are refundable. I have attached both receipts for your reference.

Could you please refund the duplicate charge of ${currencySymbol}${amount} to my original payment method?

Thank you for your quick assistance.

Best regards`;
    chatScript = `Hi, I was charged twice on ${date} for ${currencySymbol}${amount} (order ${orderId}). This looks like a duplicate. Can you please refund the extra charge? I have both receipts ready.`;
    subjectZh = `重复扣款申请退款 - 订单 ${orderId}`;
    bodyZh = `您好 ${merchant} 客服，\n\n我于 ${date} 被重复扣费 ${currencySymbol}${amount}（订单：${orderId}），疑似系统重复处理。根据支付规范，重复扣款应予退还，附件为两笔扣款凭证。\n\n烦请将重复的 ${currencySymbol}${amount} 原路退回，感谢！`;
  } else if (category === "renewal") {
    subject = `Request refund for accidental renewal - ${merchant} - ${orderId}`;
    body = `Hello ${merchant} Support Team,

I was charged ${currencySymbol}${amount} on ${date} for an automatic renewal (Order: ${orderId}). I did not intend to renew and missed the cancellation window.

I have not used the service since the renewal and would like to request a goodwill refund. I understand many subscription services offer a courtesy refund within a few days of renewal.

Could you please process a refund of ${currencySymbol}${amount} to my original payment method? I appreciate your understanding.

If a full refund is not possible, a prorated refund would also be appreciated.

Thank you.`;
    chatScript = `Hi team, I was just charged ${currencySymbol}${amount} for auto-renewal on ${date} (order ${orderId}). I didn't mean to renew and haven't used it since. Could you please help with a goodwill refund?`;
    subjectZh = `意外续费申请退款 - ${merchant}`;
    bodyZh = `您好 ${merchant} 客服，\n\n我于 ${date} 被自动续费 ${currencySymbol}${amount}（订单 ${orderId}），并非本人意愿且续费后未使用服务。\n\n恳请按善意退款处理，将 ${currencySymbol}${amount} 原路退回。如无法全额，比例退款亦可接受，感谢理解！`;
  } else if (category === "price_drop") {
    subject = `Price protection request - Found lower price for booking ${orderId}`;
    body = `Hello ${merchant} Support Team,

I booked on ${date} (Order: ${orderId}) for ${currencySymbol}${amount}, and I noticed the same item/room/flight is now available at a lower price.

Under your price protection / best price guarantee policy, could you please review and refund the price difference? I have attached screenshots with timestamps for reference.

My itinerary/order does not need to change — I would just like the price adjustment.

Thank you for your assistance.`;
    chatScript = `Hi, I booked ${orderId} on ${date} for ${currencySymbol}${amount} but now see the same one cheaper. Do you have price protection? Can you refund the difference? I have screenshots.`;
    subjectZh = `价格保护申请 - 订单 ${orderId} 发现更低价`;
    bodyZh = `您好 ${merchant} 客服，\n\n我于 ${date} 预订订单 ${orderId} 金额 ${currencySymbol}${amount}，现发现同款/同房型/同航班有更低价格。\n\n根据贵司价格保障政策，恳请核实并退还差价，附件为带时间戳的比价截图，行程无需变更，仅需调价，感谢！`;
  } else if (category === "overcharge") {
    subject = `Incorrect charge of ${currencySymbol}${amount} - Request correction for ${orderId}`;
    body = `Hello ${merchant} Support Team,

I was charged ${currencySymbol}${amount} on ${date} (Order: ${orderId}), but the expected amount was different. This appears to be an incorrect charge.

Could you please review and refund the overcharged amount? I have attached the invoice and payment record for comparison.

Thank you.`;
    chatScript = `Hi, I was charged ${currencySymbol}${amount} on ${date} for ${orderId} but this seems incorrect. Can you check and refund the difference?`;
    subjectZh = `错误收费申请更正 - ${orderId}`;
    bodyZh = `您好，我于 ${date} 被收取 ${currencySymbol}${amount}（订单 ${orderId}），与应付金额不符，疑似错误收费，烦请核实并退还多收部分。`;
  } else if (category === "warranty") {
    subject = `Warranty claim - Defective product ${orderId} purchased on ${date}`;
    body = `Hello ${merchant} Support Team,

I purchased on ${date} (Order: ${orderId}) for ${currencySymbol}${amount}. The product has developed a defect within the warranty period.

I have attached purchase proof and photos of the issue. Could you please advise on warranty repair/replacement or refund options per your warranty policy?

Thank you.`;
    chatScript = `Hi, my order ${orderId} from ${date} has a defect and should be under warranty. Can you help with repair/replacement or refund? I have photos.`;
    subjectZh = `保修申请 - 订单 ${orderId}`;
    bodyZh = `您好，我于 ${date} 购买订单 ${orderId}（${currencySymbol}${amount}）现出现故障，尚在保修期内，附件为购买凭证与故障照片，烦请按保修政策处理。`;
  } else {
    subject = `Request review for charge ${currencySymbol}${amount} on ${date} - ${orderId}`;
    body = `Hello ${merchant} Support Team,

I noticed a charge of ${currencySymbol}${amount} on ${date} (Order: ${orderId}) that I would like to review for a possible refund.

Could you please advise if this charge is eligible for a refund under your policy? I am happy to provide any additional information needed.

Thank you for your understanding.`;
    chatScript = `Hi, I have a charge of ${currencySymbol}${amount} on ${date} for ${orderId} I'd like to check if it's refundable. Can you advise?`;
    subjectZh = `申请复核 - ${date} 扣费 ${currencySymbol}${amount}`;
    bodyZh = `您好，我于 ${date} 有一笔 ${currencySymbol}${amount} 扣费（订单 ${orderId}），想咨询是否符合退款条件，烦请复核。`;
  }

  // Add footer note
  const footer = `\n\n---\nGenerated by Refund Hunter Global • Free to check, 15% only if you get refund • refundhunter.global`;
  const footerZh = `\n\n---\n由 Refund Hunter 全球版生成 • 免费检测，成功才收15% • refundhunter.global`;

  return {
    subject,
    body: body + footer,
    chatScript,
    subjectZh,
    bodyZh: bodyZh + footerZh,
  };
}
