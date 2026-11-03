import { GoogleGenAI } from '@google/genai';
import type { CardBenefits } from '../types/card';
import { findInCatalog } from '../data/cardCatalog';

const GEMINI_KEY_STORAGE = 'creditrack_gemini_api_key';

export function getStoredGeminiKey(): string {
  try {
    return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function saveStoredGeminiKey(key: string): void {
  try {
    localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
  } catch (e) {
    console.error('Error saving Gemini API key:', e);
  }
}

/**
 * Promise timeout helper to guarantee the UI never freezes or hangs indefinitely
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutErrorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutErrorMsg)), timeoutMs)
    ),
  ]);
}

/**
 * Fetches the latest benefits for a credit card.
 * Priority:
 * 1. If allowAi is true and Gemini API key is configured, calls gemini-3.8-flash with strict 7s timeout.
 * 2. If allowAi is false, no key, offline, or timeout/error: checks local pre-populated card catalog.
 * 3. Fallback: generates baseline template for user review.
 */
export async function fetchCardBenefits(
  bankName: string,
  cardName: string,
  allowAi: boolean = true
): Promise<{ benefits: CardBenefits; source: 'ai' | 'catalog' | 'default'; message?: string }> {
  const geminiKey = getStoredGeminiKey();

  // If AI is enabled and key is available, call Gemini Flash with a 30s timeout
  if (allowAi && geminiKey) {
    try {
      const aiBenefits = await withTimeout(
        fetchWithGemini(bankName, cardName, geminiKey),
        30000,
        'Gemini benefits fetch timed out after 30 seconds'
      );
      if (aiBenefits) {
        return {
          benefits: aiBenefits,
          source: 'ai',
          message: 'Fetched latest live terms and benefits via Gemini AI.',
        };
      }
    } catch (err: unknown) {
      console.warn('Gemini fetch skipped or timed out, falling back to local catalog:', err);
    }
  }

  // Check catalog
  const catalogMatch = findInCatalog(bankName, cardName);
  if (catalogMatch) {
    return {
      benefits: catalogMatch.benefits,
      source: 'catalog',
      message: 'Loaded verified benefits from local catalog.',
    };
  }

  // Default baseline
  const isRupay = cardName.toLowerCase().includes('rupay') || bankName.toLowerCase().includes('rupay');
  const defaultBenefits: CardBenefits = {
    domesticLounge: {
      available: false,
      details: 'Check your official bank welcome kit or website for airport lounge eligibility.',
    },
    internationalLounge: {
      available: false,
      details: 'No international lounge access recorded.',
    },
    rewardRate: {
      basePercent: 1.0,
      rewardPointsPer100: 2,
    },
    cashbackHighlights: [
      { category: 'General Spends', rate: '1% value back' },
    ],
    milestones: [],
    forexMarkup: {
      ratePercent: 3.5,
      details: 'Standard 3.5% + GST foreign currency markup fee.',
    },
    fuelSurchargeWaiver: {
      available: true,
      details: '1% fuel surcharge waiver (typically on transactions between ₹400 and ₹4,000).',
    },
    annualFee: {
      amount: 'Contact issuer',
      waiverSpend: 'Contact issuer',
    },
    isRupayUPI: isRupay,
    summaryPoints: [
      'Standard retail reward points on everyday purchases',
      '1% fuel surcharge waiver at fuel outlets',
    ],
    allPerks: [
      { category: 'reward_points', title: 'Base Rewards', description: 'Standard reward points on all eligible domestic purchases.' },
      { category: 'fuel', title: '1% Fuel Waiver', description: 'Fuel surcharge waiver at authorized fuel stations.' },
    ],
  };

  return {
    benefits: defaultBenefits,
    source: 'default',
    message: geminiKey
      ? 'No exact match found; baseline created.'
      : 'Loaded default card structure. Add a Gemini API key in Settings for live web fetching.',
  };
}

/**
 * Call Gemini 3.8 Flash to extract structured benefits
 */
async function fetchWithGemini(bankName: string, cardName: string, apiKey: string): Promise<CardBenefits | null> {
  const client = new GoogleGenAI({ apiKey });

  const systemInstruction = `
You are an expert credit card analyst specializing in Indian and global credit cards.
Your task is to fetch and return the most current, up-to-date benefits, lounge rules (including 2024-2026 spend criteria/devaluations), reward multipliers, milestone benefits, and fees for the specified credit card.
Return ONLY valid JSON matching the exact schema requested, with no markdown code fences or conversational text.
`;

  const prompt = `
Extract the latest benefits and terms for:
Bank / Provider: "${bankName}"
Card Name: "${cardName}"

Ensure you include:
1. Domestic & International airport lounge access (specify exact quarterly limits and spend criteria, e.g. "Spend ₹50k or ₹1L in previous quarter", or "Discontinued").
2. Base reward rate percentage & top category multipliers.
3. Specific cashback highlights (e.g. 5% on Amazon/Airtel/Swiggy with monthly caps).
4. Milestone rewards (quarterly or annual spend bonus points / vouchers).
5. Forex markup percentage (e.g. 0%, 2%, 3.5%).
6. Fuel surcharge waiver details.
7. Joining / Annual renewal fee & spend waiver threshold.
8. Whether it is RuPay UPI enabled.
9. Any recent alerts or devaluations.

JSON Structure:
{
  "domesticLounge": { "available": boolean, "countPerQuarter": number or string, "details": string, "spendCriteria": string or null },
  "internationalLounge": { "available": boolean, "countPerYear": number or string, "program": string, "details": string },
  "rewardRate": { "basePercent": number, "rewardPointsPer100": number, "pointsValueRupees": number, "multipliers": [{ "category": string, "rate": string }] },
  "cashbackHighlights": [{ "category": string, "rate": string, "capsOrLimits": string }],
  "milestones": [{ "spendAmount": string, "reward": string, "timeframe": "quarterly" | "annual" | "monthly" }],
  "forexMarkup": { "ratePercent": number, "details": string },
  "fuelSurchargeWaiver": { "available": boolean, "details": string, "minSpend": number, "maxSpend": number },
  "annualFee": { "amount": string, "waiverSpend": string },
  "isRupayUPI": boolean,
  "recentChangesOrAlerts": [string],
  "summaryPoints": [string],
  "allPerks": [{ "category": "lounge" | "cashback" | "reward_points" | "milestone" | "fuel" | "forex" | "dining" | "movies" | "upi" | "general", "title": string, "description": string, "highlight": string }]
}
`;

  const fullPrompt = `${systemInstruction}\n\n${prompt}\nNote: Keep descriptions concise and punchy to speed up response generation.`;

  let text = '';
  try {
    const response = await client.interactions.create({
      model: 'gemini-3.8-flash',
      input: fullPrompt,
    });
    text = response.output_text?.trim() || '';
  } catch (interactionErr) {
    console.warn('Gemini interactions.create failed, falling back to models.generateContent:', interactionErr);
    try {
      const genResponse = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });
      text = genResponse.text?.trim() || '';
    } catch (modelErr) {
      console.error('Gemini models.generateContent fallback also failed:', modelErr);
      return null;
    }
  }

  if (!text) return null;

  // Extract JSON if wrapped in markdown
  let cleanJson = text;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    cleanJson = jsonMatch[1];
  }

  try {
    const parsed = JSON.parse(cleanJson);
    return parsed as CardBenefits;
  } catch (parseErr) {
    console.warn('Failed to parse Gemini response as JSON:', parseErr);
    return null;
  }
}
