import { NextResponse } from 'next/server';
import { calculateEstimate } from '@/lib/engine/calculator';
import { AssessmentInput, CalculationResult, SavedEstimate } from '@/lib/engine/types';
import { getMarketPrices, getQualityRules, saveEstimateRecord, getFactories } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth';
import { estimateTeaValueWithGemini } from '@/lib/gemini/service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input: AssessmentInput = body.input;
    const shouldSave = !!body.save;
    const useGemini = body.useGemini !== false; // Gemini AI enabled by default

    if (!input || !input.district || !input.harvestedWeightKg) {
      return NextResponse.json({ error: 'Missing mandatory assessment fields (district, harvested weight).' }, { status: 400 });
    }

    if (input.harvestedWeightKg <= 0) {
      return NextResponse.json({ error: 'Harvested weight must be greater than 0 kg.' }, { status: 400 });
    }

    const factories = await getFactories();
    const targetFactory = input.targetFactoryId ? factories.find((f) => f.id === input.targetFactoryId) : undefined;
    const factoryName = targetFactory?.name;

    let result: CalculationResult | undefined;
    let geminiNotice: string | undefined;

    // 1. Attempt Gemini AI evaluation when enabled
    if (useGemini) {
      if (process.env.GEMINI_API_KEY) {
        const geminiValuation = await estimateTeaValueWithGemini({ input, factoryName });
        if (geminiValuation.success && geminiValuation.result) {
          result = geminiValuation.result;
        } else {
          geminiNotice = geminiValuation.message;
        }
      } else {
        geminiNotice = 'GEMINI_API_KEY is not configured in .env.local. Using local benchmark records.';
      }
    }

    // 2. Fallback to deterministic calculation engine if Gemini was not used or failed
    if (!result) {
      const isDemo = process.env.DEMO_MODE === 'true';
      const allRecords = await getMarketPrices();
      const allRules = await getQualityRules();

      result = calculateEstimate(input, allRecords, allRules, {
        pricingDate: input.harvestTimestamp ? input.harvestTimestamp.split('T')[0] : undefined,
        demoMode: isDemo,
      });

      // If database has no verified records for current date (unavailable) and demoMode was false,
      // fallback to demo benchmark records so the user still gets realistic telemetry
      if (result.status === 'unavailable' && !isDemo) {
        const fallbackResult = calculateEstimate(input, allRecords, allRules, {
          pricingDate: input.harvestTimestamp ? input.harvestTimestamp.split('T')[0] : undefined,
          demoMode: true,
        });
        if (fallbackResult.status !== 'unavailable') {
          result = fallbackResult;
        }
      }
    }

    let savedId: string | undefined;

    // If requested and user is authenticated, save the immutable snapshot
    const user = await getCurrentUser();
    if (shouldSave && user) {
      const estimateToSave: SavedEstimate = {
        id: `est-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: user.id,
        createdAt: new Date().toISOString(),
        inputSnapshot: input,
        resultSnapshot: result,
        targetFactorySnapshot: targetFactory,
        notes: input.notes,
      };

      await saveEstimateRecord(estimateToSave);
      savedId = estimateToSave.id;
    }

    return NextResponse.json({
      success: true,
      result,
      savedId,
      geminiNotice,
      valuationEngine: result.valuationEngine || 'deterministic',
    });
  } catch (error: any) {
    console.error('Estimate calculation API error:', error);
    return NextResponse.json({ error: error.message || 'Price calculation failed.' }, { status: 400 });
  }
}
