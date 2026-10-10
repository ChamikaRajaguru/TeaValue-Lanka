import { describe, it, expect } from 'vitest';
import {
  calculateElapsedHours,
  filterEligibleRecords,
  calculateEstimate,
  CALCULATION_VERSION,
} from '../calculator';
import {
  AssessmentInput,
  MarketPriceRecord,
  QualityRule,
} from '../types';

describe('TeaValue Price Estimation Engine', () => {
  const mockValidPriceRecord: MarketPriceRecord = {
    id: 'rec-1',
    productType: 'raw_green_leaf',
    district: 'Galle',
    locality: 'Neluwa',
    priceBasis: 'factory-base',
    minPrice: 240,
    maxPrice: 250,
    currency: 'LKR',
    unit: 'kg',
    observedDate: '2026-10-01',
    validFrom: '2026-10-01',
    validTo: '2026-10-31',
    datePrecision: 'month',
    sourceName: 'Neluwa Tea Factory Monthly Notice',
    sourceType: 'factory quote',
    verificationStatus: 'verified',
    discoveryMethod: 'manual',
    demoFlag: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  };

  const mockBaseInput: AssessmentInput = {
    district: 'Galle',
    locality: 'Neluwa',
    elevationCategory: 'low',
    harvestedWeightKg: 100,
    harvestTimestamp: '2026-10-10T06:00:00Z',
    deliveryTimestamp: '2026-10-10T10:00:00Z',
    surfaceCondition: 'dry',
    packagingCondition: 'loosely_packed',
  };

  it('rejects delivery timestamps earlier than harvest timestamps', () => {
    expect(() => {
      calculateElapsedHours('2026-10-10T10:00:00Z', '2026-10-10T08:00:00Z');
    }).toThrow('Planned delivery timestamp cannot be earlier than harvest timestamp');
  });

  it('rejects future harvest timestamps', () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    expect(() => {
      calculateElapsedHours(futureDate, futureDate);
    }).toThrow('Harvest timestamp cannot be in the future');
  });

  it('excludes unverified and expired market price records', () => {
    const unverified: MarketPriceRecord = {
      ...mockValidPriceRecord,
      id: 'rec-unverified',
      verificationStatus: 'pending',
    };
    const expired: MarketPriceRecord = {
      ...mockValidPriceRecord,
      id: 'rec-expired',
      validFrom: '2026-08-01',
      validTo: '2026-08-31',
    };

    const eligible = filterEligibleRecords(
      [mockValidPriceRecord, unverified, expired],
      '2026-10-10',
      false
    );

    expect(eligible).toHaveLength(1);
    expect(eligible[0].id).toBe('rec-1');
  });

  it('excludes manufactured tea or non-raw-leaf records', () => {
    const madeTeaRecord: any = {
      ...mockValidPriceRecord,
      id: 'rec-made-tea',
      productType: 'manufactured_black_tea',
    };

    const eligible = filterEligibleRecords([madeTeaRecord], '2026-10-10', false);
    expect(eligible).toHaveLength(0);
  });

  it('returns unavailable when no verified records match', () => {
    const result = calculateEstimate(
      { ...mockBaseInput, district: 'Jaffna' },
      [mockValidPriceRecord],
      [],
      { pricingDate: '2026-10-10' }
    );

    expect(result.status).toBe('unavailable');
    expect(result.estimatedPriceMin).toBe(0);
    expect(result.recordsUsed).toHaveLength(0);
  });

  it('calculates gross revenue with assumed payable weight when expected accepted weight is omitted', () => {
    const result = calculateEstimate(
      mockBaseInput,
      [mockValidPriceRecord],
      [],
      { pricingDate: '2026-10-10' }
    );

    expect(result.payableWeightKg).toBe(100);
    expect(result.isPayableWeightAssumed).toBe(true);
    // Base 240 - 250
    expect(result.estimatedPriceMin).toBe(240);
    expect(result.estimatedPriceMax).toBe(250);
    // Gross: 100 * 240 = 24,000; 100 * 250 = 25,000
    expect(result.grossRevenueMin).toBe(24000);
    expect(result.grossRevenueMax).toBe(25000);
    expect(result.netRevenueMin).toBe(24000);
  });

  it('correctly applies verified fixed and percentage quality rules in deterministic order', () => {
    const rules: QualityRule[] = [
      {
        id: 'rule-percentage',
        name: 'Prime Pluck Bonus',
        code: 'PRIME_BONUS',
        scope: 'district',
        district: 'Galle',
        conditions: { minGoodLeaf: 70 },
        appliesToBaseBasis: ['factory-base', 'generic'],
        adjustmentType: 'percentage',
        adjustmentValue: 5, // +5%
        effectiveFrom: '2026-10-01',
        effectiveTo: '2026-10-31',
        priority: 2,
        verificationStatus: 'verified',
        explanationEn: '5% bonus for leaf samples with >=70% tender buds',
        explanationSi: '70% ට වැඩි දළු සඳහා 5% ක ප්‍රසාද මුදලක්',
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
      },
      {
        id: 'rule-fixed',
        name: 'Direct Farm Transport Subsidy',
        code: 'TRANSPORT_ADDON',
        scope: 'district',
        district: 'Galle',
        conditions: { maxElapsedHours: 6 },
        appliesToBaseBasis: ['factory-base', 'generic'],
        adjustmentType: 'fixed_per_kg',
        adjustmentValue: 10, // +10 LKR/kg
        effectiveFrom: '2026-10-01',
        effectiveTo: '2026-10-31',
        priority: 1, // Runs first
        verificationStatus: 'verified',
        explanationEn: '10 LKR/kg bonus for delivery within 6 hours',
        explanationSi: 'පැය 6 ක් ඇතුළත සැපයීම සඳහා රු. 10 ක දීමනාවක්',
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
      },
    ];

    const inputWithQuality: AssessmentInput = {
      ...mockBaseInput,
      goodLeafPercentage: 75,
      harvestTimestamp: '2026-10-10T06:00:00Z',
      deliveryTimestamp: '2026-10-10T09:00:00Z', // 3 hours
    };

    const result = calculateEstimate(
      inputWithQuality,
      [mockValidPriceRecord],
      rules,
      { pricingDate: '2026-10-10' }
    );

    // Initial: 240 - 250
    // Fixed: +10 => 250 - 260
    // Percentage +5%: 250 * 0.05 = 12.50 => 262.50; 260 * 0.05 = 13.00 => 273.00
    expect(result.estimatedPriceMin).toBe(262.5);
    expect(result.estimatedPriceMax).toBe(273);
    expect(result.appliedRules).toHaveLength(2);
    expect(result.status).toBe('personalized_estimate');
  });

  it('does NOT double-adjust quality-specific records with quality rules', () => {
    const qualitySpecificRecord: MarketPriceRecord = {
      ...mockValidPriceRecord,
      id: 'rec-quality-spec',
      priceBasis: 'quality-specific',
      qualityCategoryRef: 'Grade A Super Leaf',
      minPrice: 280,
      maxPrice: 280,
    };

    const qualityRule: QualityRule = {
      id: 'rule-quality',
      name: 'Super Leaf Bonus',
      code: 'SUPER_BONUS',
      scope: 'district',
      district: 'Galle',
      conditions: { minGoodLeaf: 80 },
      appliesToBaseBasis: ['quality-specific', 'factory-base'],
      adjustmentType: 'fixed_per_kg',
      adjustmentValue: 20,
      effectiveFrom: '2026-10-01',
      effectiveTo: '2026-10-31',
      priority: 1,
      verificationStatus: 'verified',
      explanationEn: 'Bonus',
      explanationSi: 'ප්‍රසාද මුදල',
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
    };

    const result = calculateEstimate(
      { ...mockBaseInput, goodLeafPercentage: 85 },
      [qualitySpecificRecord],
      [qualityRule],
      { pricingDate: '2026-10-10' }
    );

    // Price should remain 280 without double adjustment
    expect(result.estimatedPriceMin).toBe(280);
    expect(result.estimatedPriceMax).toBe(280);
    expect(result.appliedRules).toHaveLength(0);
  });

  it('preserves negative net revenue without silently clamping to zero', () => {
    // If farmer has 50 kg harvested at 240 LKR = 12,000 LKR gross,
    // but total transport cost was 15,000 LKR (e.g. long distance vehicle hire),
    // Net revenue must be -3,000 LKR, NOT clamped to 0!
    const inputWithHighCost: AssessmentInput = {
      ...mockBaseInput,
      harvestedWeightKg: 50,
      totalTransportCost: 15000,
    };

    const result = calculateEstimate(
      inputWithHighCost,
      [mockValidPriceRecord],
      [],
      { pricingDate: '2026-10-10' }
    );

    // 50 * 240 = 12,000; Net = 12,000 - 15,000 = -3,000
    expect(result.grossRevenueMin).toBe(12000);
    expect(result.netRevenueMin).toBe(-3000);
    expect(result.netRevenueMin).toBeLessThan(0);
  });

  it('respects exclusive groups and does not stack incompatible rules', () => {
    const rule1: QualityRule = {
      id: 'rule-excl-1',
      name: 'Option A Incentive',
      code: 'OPT_A',
      scope: 'general',
      conditions: {},
      appliesToBaseBasis: ['factory-base'],
      adjustmentType: 'fixed_per_kg',
      adjustmentValue: 15,
      effectiveFrom: '2026-10-01',
      effectiveTo: '2026-10-31',
      priority: 1,
      exclusiveGroup: 'PROMO_GROUP',
      verificationStatus: 'verified',
      explanationEn: 'Option A',
      explanationSi: 'විකල්පය A',
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
    };

    const rule2: QualityRule = {
      id: 'rule-excl-2',
      name: 'Option B Incentive',
      code: 'OPT_B',
      scope: 'general',
      conditions: {},
      appliesToBaseBasis: ['factory-base'],
      adjustmentType: 'fixed_per_kg',
      adjustmentValue: 10,
      effectiveFrom: '2026-10-01',
      effectiveTo: '2026-10-31',
      priority: 2,
      exclusiveGroup: 'PROMO_GROUP',
      verificationStatus: 'verified',
      explanationEn: 'Option B',
      explanationSi: 'විකල්පය B',
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
    };

    const result = calculateEstimate(
      mockBaseInput,
      [mockValidPriceRecord],
      [rule1, rule2],
      { pricingDate: '2026-10-10' }
    );

    // Only rule1 should apply because of priority 1 and shared exclusive group
    expect(result.appliedRules).toHaveLength(1);
    expect(result.appliedRules[0].ruleCode).toBe('OPT_A');
    expect(result.estimatedPriceMin).toBe(255);
  });
});
