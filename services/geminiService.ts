
import { GoogleGenAI, Chat } from "@google/genai";

const AI_ANALYSIS_MODEL = 'gemini-3-flash-preview';
const CHAT_MODEL = 'gemini-3-pro-preview';
const CACHE_KEY = 'zarin_gold_analysis_cache';
const COOLDOWN_KEY = 'zarin_gold_api_cooldown';
const REQUEST_INTERVAL = 15 * 60 * 1000; 
const ERROR_COOLDOWN = 30 * 60 * 1000; 

interface AnalysisCache {
  text: string;
  timestamp: number;
  price: number;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * Provides automated market sentiment analysis for the dashboard.
 */
export async function getMarketAnalysis(currentPrice: number): Promise<string> {
  const now = Date.now();
  const cooldownEnd = parseInt(localStorage.getItem(COOLDOWN_KEY) || '0');
  if (now < cooldownEnd) return "سرویس تحلیل هوشمند در حالت استراحت است.";

  const cached = getLocalCache();
  if (cached && (now - cached.timestamp < REQUEST_INTERVAL)) return cached.text;

  try {
    const response = await ai.models.generateContent({
      model: AI_ANALYSIS_MODEL,
      contents: `Current Gold Price: ${currentPrice} IRR. Brief market sentiment in Persian. Max 15 words.`,
    });

    const text = response.text;
    if (text) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ text, timestamp: now, price: currentPrice }));
      return text;
    }
    return cached?.text || "تحلیل در دسترس نیست.";
  } catch (error: any) {
    if (JSON.stringify(error).includes("429")) {
      localStorage.setItem(COOLDOWN_KEY, (now + ERROR_COOLDOWN).toString());
    }
    return cached?.text || "خطا در ارتباط با هوش مصنوعی.";
  }
}

/**
 * Creates a new chat session for the interactive chatbot.
 */
export function createChatSession(): Chat {
  return ai.chats.create({
    model: CHAT_MODEL,
    config: {
      systemInstruction: `شما دستیار هوشمند و مشاور تحلیلی سامانه معاملات طلای "زرین" هستید. 
      وظایف شما:
      1. پاسخ به سوالات کاربران درباره روند بازار طلا و سکه.
      2. راهنمایی کاربران برای استفاده از بخش‌های مختلف اپلیکیشن (مانند ثبت حواله، فریز قیمت و مشاهده تاریخچه).
      3. ارائه تحلیل‌های منطقی و مودبانه به زبان فارسی.
      4. نام شما "دستیار زرین" است. همیشه حرفه‌ای و دلگرم‌کننده پاسخ دهید. 
      از ایموجی‌های مرتبط با طلا (🪙، 💰، 📈) به شکلی محدود و زیبا استفاده کنید.`,
      temperature: 0.7,
    }
  });
}

function getLocalCache(): AnalysisCache | null {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}
