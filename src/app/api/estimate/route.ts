import { NextResponse } from 'next/server';
import { calculateEstimate } from '@/lib/engine/calculator';
import { AssessmentInput, SavedEstimate } from '@/lib/engine/types';
import { getMarketPrices, getQualityRules, saveEstimateRecord, getFactories } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input: AssessmentInput = body.input;
    const shouldSave = !!body.save;

    if (!input || !input.district || !input.harvestedWeightKg) {
      return NextResponse.json({ error: 'Missing mandatory assessment fields (district, harvested weight).' }, { status: 400 });
    }

    if (input.harvestedWeightKg <= 0) {
      return NextResponse.json({ error: 'Harvested weight must be greater than 0 kg.' }, { status: 400 });
    }

    // Load market prices and quality rules
    const isDemo = process.env.DEMO_MODE === 'true';
    const allRecords = await getMarketPrices();
    const allRules = await getQualityRules();

    // Run deterministic calculation
    const result = calculateEstimate(input, allRecords, allRules, {
      pricingDate: input.harvestTimestamp ? input.harvestTimestamp.split('T')[0] : undefined,
      demoMode: isDemo,
    });

    let savedId: string | undefined;

    // If requested and user is authenticated, save the immutable snapshot
    const user = await getCurrentUser();
    if (shouldSave && user) {
      const factories = await getFactories();
      const targetFactory = input.targetFactoryId ? factories.find((f) => f.id === input.targetFactoryId) : undefined;

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
    });
  } catch (error: any) {
    console.error('Estimate calculation API error:', error);
    return NextResponse.json({ error: error.message || 'Price calculation failed.' }, { status: 400 });
  }
}
