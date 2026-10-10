import { GoogleGenAI } from '@google/genai';
import { MarketPriceRecord } from '../engine/types';

export interface DiscoveryResult {
  success: boolean;
  message: string;
  candidates: MarketPriceRecord[];
  rawResponse?: string;
  groundingSources?: Array<{ title?: string; url?: string }>;
}

/**
 * Server-only service to discover published raw green leaf price candidates using @google/genai.
 * Discovered candidates are NEVER auto-verified: they are marked as 'pending' for Admin review.
 */
export async function discoverRawLeafPrices(params: {
  district: string;
  factoryName?: string;
  yearMonth?: string; // YYYY-MM
}): Promise<DiscoveryResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey) {
    return {
      success: false,
      message: 'Gemini API key is not configured (GEMINI_API_KEY). Using administrative manual records.',
      candidates: [],
    };
  }

  const currentDate = new Date().toISOString().split('T')[0];
  const targetPeriod = params.yearMonth || currentDate.substring(0, 7);

  const prompt = `You are a specialized agricultural market researcher for Sri Lanka.
TASK: Search and discover published Sri Lankan RAW FRESH GREEN TEA LEAF (දළු / අමු තේ දළු) prices paid to smallholders for the period ${targetPeriod}.
TARGET DISTRICT: ${params.district}
${params.factoryName ? `TARGET FACTORY: ${params.factoryName}` : ''}

STRICT PRODUCT CONSTRAINTS:
1. Extract ONLY raw green leaf (freshly harvested leaves supplied by farmers to factories).
2. DO NOT include manufactured black tea prices, made tea, tea auction prices (Colombo auction averages), retail packet prices, or export prices.
3. If an article mentions "BOP", "BOPF", "Auction average Rs. 1200", DO NOT include it—that is made tea, not raw green leaf.
4. Raw green leaf prices in Sri Lanka typically range between 180 and 350 LKR per kilogram.
5. Return JSON ONLY in the following exact format:
{
  "candidates": [
    {
      "factoryName": "Name of factory or null if general district benchmark",
      "district": "${params.district}",
      "locality": "Locality or null",
      "minPrice": 240,
      "maxPrice": 255,
      "currency": "LKR",
      "unit": "kg",
      "applicableDate": "${targetPeriod}-01",
      "validFrom": "${targetPeriod}-01",
      "validTo": "${targetPeriod}-30",
      "sourceName": "Name of publisher or organization",
      "sourceUrl": "Source link if available",
      "sourceExcerpt": "Direct quote from source verifying the price and product type"
    }
  ]
}
If no verified raw leaf prices are found, return {"candidates": []}. Do NOT invent or hallucinate numbers.`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Enable Google Search Grounding if supported
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        // tools: [{ googleSearch: {} }],
        temperature: 0.1, // low temperature to avoid hallucination
      },
    });

    const text = response.text || '';
    
    // Parse JSON from output
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        message: 'Could not extract structured price data from search results.',
        candidates: [],
        rawResponse: text,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed.candidates)) {
      return {
        success: false,
        message: 'Response format lacked candidates array.',
        candidates: [],
        rawResponse: text,
      };
    }

    // Sanitize and strictly filter candidates
    const validCandidates: MarketPriceRecord[] = [];

    for (const item of parsed.candidates) {
      // 1. Currency & Unit validation
      if (item.currency !== 'LKR' || item.unit !== 'kg') continue;

      // 2. Numerical validation
      const min = Number(item.minPrice);
      const max = Number(item.maxPrice);
      if (isNaN(min) || isNaN(max) || min <= 0 || max < min) continue;

      // 3. Raw leaf plausibility check: Sri Lankan raw leaf is virtually never > 600 LKR/kg
      // If a price is > 600, it is almost certainly manufactured made tea or retail auction tea!
      if (min > 600 || max > 600) {
        console.warn(`Rejected candidate: price ${min}-${max} exceeds raw leaf threshold (likely made tea).`);
        continue;
      }

      // 4. Source verification excerpt check
      const excerpt = (item.sourceExcerpt || '').toLowerCase();
      if (
        excerpt.includes('auction') ||
        excerpt.includes('made tea') ||
        excerpt.includes('bop') ||
        excerpt.includes('export')
      ) {
        console.warn('Rejected candidate: source excerpt mentions auction or made tea terms.');
        continue;
      }

      const id = `gemini-cand-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      validCandidates.push({
        id,
        productType: 'raw_green_leaf',
        district: params.district,
        locality: item.locality || undefined,
        factoryName: item.factoryName || undefined,
        priceBasis: item.factoryName ? 'factory-base' : 'generic',
        minPrice: min,
        maxPrice: max,
        currency: 'LKR',
        unit: 'kg',
        observedDate: currentDate,
        validFrom: item.validFrom || `${targetPeriod}-01`,
        validTo: item.validTo || `${targetPeriod}-30`,
        datePrecision: 'month',
        sourceName: item.sourceName || 'Online Price Publication',
        sourceUrl: item.sourceUrl || undefined,
        sourceExcerpt: item.sourceExcerpt || 'Discovered via web search extraction',
        sourceType: 'other',
        verificationStatus: 'pending', // Strictly Pending! Requires human admin approval.
        discoveryMethod: 'gemini',
        demoFlag: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      message: `Discovered ${validCandidates.length} raw leaf price candidate(s) for review.`,
      candidates: validCandidates,
    };
  } catch (error: any) {
    console.error('Gemini discovery failure:', error);
    return {
      success: false,
      message: error?.message || 'Failed to complete discovery query with Gemini.',
      candidates: [],
    };
  }
}
