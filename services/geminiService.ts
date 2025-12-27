
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simple cache to store the last successful analysis
let cachedAnalysis: string | null = null;
let lastRequestTime = 0;
let backoffUntil = 0;
let isQuotaExhausted = false;

export async function getMarketAnalysis(currentPrice: number) {
  const now = Date.now();

  // If we've confirmed quota exhaustion, don't even try for 10 minutes
  if (isQuotaExhausted && now < backoffUntil) {
    return cachedAnalysis || "سرویس تحلیل هوشمند به دلیل محدودیت سهمیه موقتاً در دسترس نیست.";
  }

  // If we are in a backoff period, return cache
  if (now < backoffUntil) {
    return cachedAnalysis || "تحلیل بازار در فواصل زمانی بلندتر به‌روزرسانی می‌شود.";
  }

  // Strict throttling: No more than one request every 2 minutes
  if (now - lastRequestTime < 120000 && cachedAnalysis) {
    return cachedAnalysis;
  }

  try {
    lastRequestTime = now;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Price: ${currentPrice} IRR. Provide a very brief (max 20 words) market analysis for gold traders in Persian. Focus on sentiment.`,
    });

    const text = response.text;
    if (text) {
      cachedAnalysis = text;
      isQuotaExhausted = false; // Reset if successful
      return text;
    }
    return cachedAnalysis || "تحلیل جدید یافت نشد.";
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    
    const errorStr = JSON.stringify(error).toLowerCase();
    const isRateLimit = errorStr.includes("429") || errorStr.includes("resource_exhausted") || errorStr.includes("quota");

    if (isRateLimit) {
      isQuotaExhausted = true;
      // Back off for 10 minutes if we hit quota
      backoffUntil = now + 600000;
      return cachedAnalysis || "سهمیه روزانه تحلیل هوشمند به پایان رسیده است. لطفاً بعداً مراجعه کنید.";
    }

    // General error backoff for 1 minute
    backoffUntil = now + 60000;
    return cachedAnalysis || "خطا در دریافت تحلیل. در حال استفاده از داده‌های ذخیره شده...";
  }
}
