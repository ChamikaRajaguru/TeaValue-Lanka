import { describe, it, expect } from 'vitest';
import { estimateTeaValueWithGemini } from '../gemini/service';
import { AssessmentInput } from '../engine/types';

describe('Gemini Tea Leaf Valuation Service', () => {
  const dummyInput: AssessmentInput = {
    district: 'Galle',
    locality: 'Neluwa',
    elevationCategory: 'low',
    harvestedWeightKg: 100,
    harvestTimestamp: new Date().toISOString(),
    deliveryTimestamp: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    goodLeafPercentage: 74,
    coarseLeafPercentage: 12,
    damagedLeafPercentage: 4,
    surfaceCondition: 'dry',
    packagingCondition: 'loosely_packed',
    isMeasuredSample: true,
    transportCostPerKg: 4,
  };

  it('gracefully reports missing API key when GEMINI_API_KEY is not set', async () => {
    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const res = await estimateTeaValueWithGemini({ input: dummyInput, factoryName: 'Neluwa Charitha' });
      expect(res.success).toBe(false);
      expect(res.message).toContain('GEMINI_API_KEY');
    } finally {
      if (origKey !== undefined) {
        process.env.GEMINI_API_KEY = origKey;
      }
    }
  });
});
