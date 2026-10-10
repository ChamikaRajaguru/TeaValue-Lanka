import Decimal from 'decimal.js';
import {
  AssessmentInput,
  MarketPriceRecord,
  QualityRule,
  CalculationResult,
  AppliedRuleDetail,
  UnusedObservation,
  CostBreakdown,
  EstimateStatus,
} from './types';

export const CALCULATION_VERSION = '1.0.0';

/**
 * Validates harvest and delivery timestamps.
 * Returns elapsed hours or throws an error if invalid.
 */
export function calculateElapsedHours(harvestIso: string, deliveryIso: string): number {
  const harvestTime = new Date(harvestIso).getTime();
  const deliveryTime = new Date(deliveryIso).getTime();

  if (isNaN(harvestTime) || isNaN(deliveryTime)) {
    throw new Error('Invalid harvest or delivery timestamp format.');
  }

  const now = Date.now();
  if (harvestTime > now + 60000) { // allow 1 minute clock skew
    throw new Error('Harvest timestamp cannot be in the future.');
  }

  if (deliveryTime < harvestTime) {
    throw new Error('Planned delivery timestamp cannot be earlier than harvest timestamp.');
  }

  const diffMs = deliveryTime - harvestTime;
  const hours = new Decimal(diffMs).dividedBy(1000 * 60 * 60).toDecimalPlaces(2).toNumber();
  return hours;
}

/**
 * Filter verified, active price records for the target pricing date and product type.
 */
export function filterEligibleRecords(
  records: MarketPriceRecord[],
  pricingDate: string,
  demoMode: boolean = false
): MarketPriceRecord[] {
  const targetDate = pricingDate.split('T')[0];

  return records.filter((rec) => {
    // Must be raw green leaf
    if (rec.productType !== 'raw_green_leaf') return false;

    // Must be verified
    if (rec.verificationStatus !== 'verified') return false;

    // Demo mode boundary
    if (!demoMode && rec.demoFlag) return false;

    // Date validity check
    const from = rec.validFrom.split('T')[0];
    const to = rec.validTo.split('T')[0];
    if (targetDate < from || targetDate > to) return false;

    // Basic integrity
    if (rec.minPrice <= 0 || rec.maxPrice < rec.minPrice) return false;

    return true;
  });
}

export interface MatchSelection {
  matchedRecords: MarketPriceRecord[];
  matchLevel: 'exact_factory' | 'locality' | 'district' | 'regional_fallback' | 'none';
  selectedBaseRecord?: MarketPriceRecord;
}

/**
 * Step A: Location and Factory hierarchy matching
 */
export function selectBestMatchingRecords(
  eligibleRecords: MarketPriceRecord[],
  input: AssessmentInput
): MatchSelection {
  if (eligibleRecords.length === 0) {
    return { matchedRecords: [], matchLevel: 'none' };
  }

  // 1. Exact Factory match
  if (input.targetFactoryId) {
    const factoryMatches = eligibleRecords.filter(
      (r) => r.factoryId === input.targetFactoryId
    );
    if (factoryMatches.length > 0) {
      // Prefer quality-specific or factory-base
      const qualityMatch = factoryMatches.find((r) => r.priceBasis === 'quality-specific');
      return {
        matchedRecords: factoryMatches,
        matchLevel: 'exact_factory',
        selectedBaseRecord: qualityMatch || factoryMatches[0],
      };
    }
  }

  // 2. Exact Locality match within district
  if (input.locality) {
    const localityMatches = eligibleRecords.filter(
      (r) =>
        r.district.toLowerCase() === input.district.toLowerCase() &&
        r.locality &&
        r.locality.toLowerCase() === input.locality?.toLowerCase()
    );
    if (localityMatches.length > 0) {
      return {
        matchedRecords: localityMatches,
        matchLevel: 'locality',
        selectedBaseRecord: localityMatches[0],
      };
    }
  }

  // 3. District match
  const districtMatches = eligibleRecords.filter(
    (r) => r.district.toLowerCase() === input.district.toLowerCase()
  );
  if (districtMatches.length > 0) {
    return {
      matchedRecords: districtMatches,
      matchLevel: 'district',
      selectedBaseRecord: districtMatches[0],
    };
  }

  // 4. Regional fallback (if region specified e.g. Low Country, Up Country)
  if (input.growingRegion) {
    const regionalMatches = eligibleRecords.filter(
      (r) =>
        r.growingRegion &&
        r.growingRegion.toLowerCase() === input.growingRegion?.toLowerCase()
    );
    if (regionalMatches.length > 0) {
      return {
        matchedRecords: regionalMatches,
        matchLevel: 'regional_fallback',
        selectedBaseRecord: regionalMatches[0],
      };
    }
  }

  return { matchedRecords: [], matchLevel: 'none' };
}

/**
 * Checks whether an input satisfies a rule's conditions.
 */
export function doesRuleApply(
  rule: QualityRule,
  input: AssessmentInput,
  baseRecord: MarketPriceRecord,
  elapsedHours: number
): boolean {
  // Check verification
  if (rule.verificationStatus !== 'verified') return false;

  // Check factory scope
  if (rule.scope === 'factory' && rule.factoryId) {
    if (!input.targetFactoryId || rule.factoryId !== input.targetFactoryId) {
      return false;
    }
  }

  // Check district scope
  if (rule.scope === 'district' && rule.district) {
    if (rule.district.toLowerCase() !== input.district.toLowerCase()) {
      return false;
    }
  }

  // Check base price basis eligibility
  if (
    rule.appliesToBaseBasis &&
    rule.appliesToBaseBasis.length > 0 &&
    !rule.appliesToBaseBasis.includes(baseRecord.priceBasis)
  ) {
    return false;
  }

  const cond = rule.conditions;

  // Good leaf percentage requirement
  if (cond.minGoodLeaf !== undefined) {
    if (input.goodLeafPercentage === undefined || input.goodLeafPercentage < cond.minGoodLeaf) {
      return false;
    }
  }

  // Coarse leaf threshold
  if (cond.maxCoarseLeaf !== undefined) {
    if (input.coarseLeafPercentage === undefined || input.coarseLeafPercentage > cond.maxCoarseLeaf) {
      return false;
    }
  }

  // Damaged leaf threshold
  if (cond.maxDamagedLeaf !== undefined) {
    if (input.damagedLeafPercentage === undefined || input.damagedLeafPercentage > cond.maxDamagedLeaf) {
      return false;
    }
  }

  // Surface condition
  if (cond.surfaceCondition && cond.surfaceCondition !== 'unknown') {
    if (input.surfaceCondition !== cond.surfaceCondition) {
      return false;
    }
  }

  // Packaging condition
  if (cond.packagingCondition && cond.packagingCondition !== 'unknown') {
    if (input.packagingCondition !== cond.packagingCondition) {
      return false;
    }
  }

  // Elapsed hours maximum
  if (cond.maxElapsedHours !== undefined) {
    if (elapsedHours > cond.maxElapsedHours) {
      return false;
    }
  }

  return true;
}

/**
 * Pure calculation function.
 */
export function calculateEstimate(
  input: AssessmentInput,
  allPriceRecords: MarketPriceRecord[],
  allRules: QualityRule[],
  options: {
    pricingDate?: string;
    demoMode?: boolean;
  } = {}
): CalculationResult {
  const pricingDate = options.pricingDate || new Date().toISOString().split('T')[0];
  const demoMode = !!options.demoMode;

  // Validate weights
  if (input.harvestedWeightKg <= 0) {
    throw new Error('Harvested leaf weight must be greater than 0 kg.');
  }

  // Validate & calculate elapsed hours
  const elapsedHours = calculateElapsedHours(input.harvestTimestamp, input.deliveryTimestamp);

  // Payable weight determination
  let payableWeightKg: number;
  let isPayableWeightAssumed: boolean;

  if (input.expectedAcceptedWeightKg !== undefined && input.expectedAcceptedWeightKg > 0) {
    payableWeightKg = input.expectedAcceptedWeightKg;
    isPayableWeightAssumed = false;
  } else {
    payableWeightKg = input.harvestedWeightKg;
    isPayableWeightAssumed = true;
  }

  // Step A: Determine eligible records
  const eligibleRecords = filterEligibleRecords(allPriceRecords, pricingDate, demoMode);
  const selection = selectBestMatchingRecords(eligibleRecords, input);

  // Disclaimers boilerplate
  const disclaimers = {
    en: [
      'This calculation is an advisory estimation based on verified historical and published market records. It is not a guaranteed purchase contract or binding factory quotation.',
      'Actual factory payable weight is determined at the factory weighbridge after quality and moisture inspection.',
      'Tea prices in Sri Lanka vary by factory, tea board minimum benchmarks, and monthly made-tea averages.',
    ],
    si: [
      'මෙම ගණනය කිරීම ප්‍රකාශිත වෙළඳපල දත්ත මත පදනම් වූ ඇස්තමේන්තුවක් පමණක් වන අතර කර්මාන්තශාලා මිලදී ගැනීමේ සහතිකයක් නොවේ.',
      'සැබෑ ගෙවිය හැකි ශුද්ධ බර කර්මාන්තශාලා දළු මඩුවේදී පරීක්ෂා කිරීමෙන් පසු තීරණය වේ.',
      'ශ්‍රී ලංකාවේ අමු තේ දළු මිල කර්මාන්තශාලාව, තේ මණ්ඩල නිර්දේශ සහ මාසික සාමාන්‍ය මිල අනුව වෙනස් විය හැක.',
    ],
  };

  if (selection.matchLevel === 'regional_fallback') {
    disclaimers.en.push(
      'Notice: No direct district or factory record was available. A broader regional market reference was utilized.'
    );
    disclaimers.si.push(
      'දැනුම්දීම: මෙම දිස්ත්‍රික්කයට සෘජු මිල වාර්තා නොමැති බැවින් කලාපීය සාමාන්‍ය දත්ත භාවිත කර ඇත.'
    );
  }

  // If no records match, return UNAVAILABLE
  if (selection.matchedRecords.length === 0 || !selection.selectedBaseRecord) {
    return {
      status: 'unavailable',
      pricingDate,
      elapsedHours,
      payableWeightKg,
      isPayableWeightAssumed,
      harvestedWeightKg: input.harvestedWeightKg,
      basePriceMin: 0,
      basePriceMax: 0,
      estimatedPriceMin: 0,
      estimatedPriceMax: 0,
      grossRevenueMin: 0,
      grossRevenueMax: 0,
      netRevenueMin: 0,
      netRevenueMax: 0,
      appliedRules: [],
      unusedObservations: [],
      recordsUsed: [],
      locationMatchLevel: 'none',
      costBreakdown: {
        transportCostTotal: 0,
        transportCostPerKg: 0,
        isTransportEstimated: true,
        otherDeductions: 0,
        totalDeductions: 0,
      },
      limitations: {
        en: [
          'No verified raw green leaf price records found matching this date, location, or factory.',
          ...disclaimers.en,
        ],
        si: [
          'මෙම දිනය, ප්‍රදේශය හෝ කර්මාන්තශාලාව සඳහා තහවුරු කළ අමු තේ දළු මිල දත්ත හමු නොවීය.',
          ...disclaimers.si,
        ],
      },
      calculatedAt: new Date().toISOString(),
      calculationVersion: CALCULATION_VERSION,
    };
  }

  const baseRecord = selection.selectedBaseRecord;
  let basePriceMinD = new Decimal(baseRecord.minPrice);
  let basePriceMaxD = new Decimal(baseRecord.maxPrice);

  // If multiple matching records exist at the same level, calculate observed range
  if (selection.matchedRecords.length > 1) {
    let minObserved = baseRecord.minPrice;
    let maxObserved = baseRecord.maxPrice;
    for (const r of selection.matchedRecords) {
      if (r.minPrice < minObserved) minObserved = r.minPrice;
      if (r.maxPrice > maxObserved) maxObserved = r.maxPrice;
    }
    basePriceMinD = new Decimal(minObserved);
    basePriceMaxD = new Decimal(maxObserved);
  }

  // Step B: Apply verified rules
  // Rule filtering
  const applicableRules = allRules.filter((r) => {
    if (r.verificationStatus !== 'verified') return false;
    const from = r.effectiveFrom.split('T')[0];
    const to = r.effectiveTo.split('T')[0];
    if (pricingDate < from || pricingDate > to) return false;
    return doesRuleApply(r, input, baseRecord, elapsedHours);
  });

  // Sort rules by priority (ascending: lower number = higher priority)
  applicableRules.sort((a, b) => a.priority - b.priority);

  // Apply rules without stacking within exclusive groups
  const appliedRules: AppliedRuleDetail[] = [];
  const handledExclusiveGroups = new Set<string>();

  let adjustedMinD = basePriceMinD;
  let adjustedMaxD = basePriceMaxD;

  // IMPORTANT CONSTRAINT: If base record is already 'quality-specific', do NOT double adjust quality premiums!
  const isAlreadyQualitySpecific = baseRecord.priceBasis === 'quality-specific';

  // 1. Fixed adjustments
  for (const rule of applicableRules) {
    if (rule.exclusiveGroup && handledExclusiveGroups.has(rule.exclusiveGroup)) {
      continue;
    }

    if (rule.adjustmentType === 'fixed_per_kg') {
      if (isAlreadyQualitySpecific && rule.adjustmentValue > 0) {
        // Skip adding another quality bonus to an already quality-rated price
        continue;
      }

      const adj = new Decimal(rule.adjustmentValue);
      adjustedMinD = adjustedMinD.plus(adj);
      adjustedMaxD = adjustedMaxD.plus(adj);

      appliedRules.push({
        ruleId: rule.id,
        ruleCode: rule.code,
        ruleName: rule.name,
        adjustmentType: rule.adjustmentType,
        adjustmentValue: rule.adjustmentValue,
        effectiveAdjustmentPerKg: adj.toNumber(),
        explanationEn: rule.explanationEn,
        explanationSi: rule.explanationSi,
      });

      if (rule.exclusiveGroup) {
        handledExclusiveGroups.add(rule.exclusiveGroup);
      }
    }
  }

  // 2. Percentage adjustments
  for (const rule of applicableRules) {
    if (rule.exclusiveGroup && handledExclusiveGroups.has(rule.exclusiveGroup)) {
      continue;
    }

    if (rule.adjustmentType === 'percentage') {
      if (isAlreadyQualitySpecific && rule.adjustmentValue > 0) {
        continue;
      }

      const factor = new Decimal(rule.adjustmentValue).dividedBy(100);
      const adjMin = adjustedMinD.times(factor).toDecimalPlaces(2);
      const adjMax = adjustedMaxD.times(factor).toDecimalPlaces(2);

      adjustedMinD = adjustedMinD.plus(adjMin);
      adjustedMaxD = adjustedMaxD.plus(adjMax);

      appliedRules.push({
        ruleId: rule.id,
        ruleCode: rule.code,
        ruleName: rule.name,
        adjustmentType: rule.adjustmentType,
        adjustmentValue: rule.adjustmentValue,
        effectiveAdjustmentPerKg: adjMin.toNumber(),
        explanationEn: rule.explanationEn,
        explanationSi: rule.explanationSi,
      });

      if (rule.exclusiveGroup) {
        handledExclusiveGroups.add(rule.exclusiveGroup);
      }
    }
  }

  // Ensure minimum price doesn't drop below 0
  if (adjustedMinD.lessThan(0)) adjustedMinD = new Decimal(0);
  if (adjustedMaxD.lessThan(adjustedMinD)) adjustedMaxD = adjustedMinD;

  // Track unused observations for transparency
  const unusedObservations: UnusedObservation[] = [];
  const appliedCodes = new Set(appliedRules.map((r) => r.ruleCode));

  if (input.goodLeafPercentage !== undefined && appliedRules.length === 0) {
    unusedObservations.push({
      field: 'goodLeafPercentage',
      value: `${input.goodLeafPercentage}%`,
      reasonEn:
        'No verified factory rule was active to apply a numerical incentive for this good leaf percentage.',
      reasonSi:
        'මෙම දළු ප්‍රමිතිය සඳහා මිල වැඩි කිරීමට අදාළ කර්මාන්තශාලා රීතියක් සක්‍රියව නොතිබුණි.',
    });
  }

  if (input.surfaceCondition === 'wet') {
    const hasWetRule = appliedRules.some((r) => r.explanationEn.toLowerCase().includes('wet'));
    if (!hasWetRule) {
      unusedObservations.push({
        field: 'surfaceCondition',
        value: 'wet',
        reasonEn:
          'Surface moisture noted. Factory may apply a water deduction at weighing if leaves are excessively wet.',
        reasonSi:
          'තෙතමනය සහිත දළු සඳහා කිරුම් මඩුවේදී වතුර අඩු කිරීමක් (water deduction) සිදුවිය හැක.',
      });
    }
  }

  if (input.packagingCondition === 'tightly_compressed') {
    const hasCompRule = appliedRules.some((r) =>
      r.explanationEn.toLowerCase().includes('compressed')
    );
    if (!hasCompRule) {
      unusedObservations.push({
        field: 'packagingCondition',
        value: 'tightly_compressed',
        reasonEn:
          'Tightly compressed leaves generate heat, reducing leaf grade upon arrival. Advised to pack loosely.',
        reasonSi:
          'තදින් ඇසුරුම් කළ දළු රත් වී ගුණාත්මකභාවය අඩුවේ. ලිහිල්ව අසුරා ප්‍රවාහනය කිරීම යෝග්‍ය වේ.',
      });
    }
  }

  if (elapsedHours > 8) {
    unusedObservations.push({
      field: 'elapsedHours',
      value: `${elapsedHours} hours`,
      reasonEn: `Leaf transit time is ${elapsedHours} hours. Delays over 8 hours can increase fermentation and stalk red-ends.`,
      reasonSi: `දළු ප්‍රවාහන කාලය පැය ${elapsedHours} කි. පැය 8 ඉක්මවීමෙන් දළු රතු වීම හා පැසීම ඉහළ යයි.`,
    });
  }

  // Step C: Calculate revenue
  const payableD = new Decimal(payableWeightKg);
  const grossMinD = payableD.times(adjustedMinD).toDecimalPlaces(2);
  const grossMaxD = payableD.times(adjustedMaxD).toDecimalPlaces(2);

  // Transport and cost calculations
  let transportTotalD = new Decimal(0);
  let transportPerKgD = new Decimal(0);
  let isTransportEstimated = true;

  if (input.totalTransportCost !== undefined && input.totalTransportCost > 0) {
    transportTotalD = new Decimal(input.totalTransportCost);
    transportPerKgD = transportTotalD.dividedBy(payableD).toDecimalPlaces(2);
    isTransportEstimated = !input.isTransportCostConfirmed;
  } else if (input.transportCostPerKg !== undefined && input.transportCostPerKg > 0) {
    transportPerKgD = new Decimal(input.transportCostPerKg);
    transportTotalD = transportPerKgD.times(payableD).toDecimalPlaces(2);
    isTransportEstimated = !input.isTransportCostConfirmed;
  }

  const otherDeductionsD = new Decimal(input.otherDeductions || 0).toDecimalPlaces(2);
  const totalDeductionsD = transportTotalD.plus(otherDeductionsD);

  // Net revenue = gross - total deductions
  // CRITICAL: DO NOT SILENTLY CLAMP NEGATIVE NET REVENUE TO ZERO!
  const netMinD = grossMinD.minus(totalDeductionsD).toDecimalPlaces(2);
  const netMaxD = grossMaxD.minus(totalDeductionsD).toDecimalPlaces(2);

  // Status determination
  let status: EstimateStatus = 'personalized_estimate';
  if (baseRecord.priceBasis === 'generic' && appliedRules.length === 0) {
    status = 'market_reference_only';
  }

  const costBreakdown: CostBreakdown = {
    transportCostTotal: transportTotalD.toNumber(),
    transportCostPerKg: transportPerKgD.toNumber(),
    isTransportEstimated,
    otherDeductions: otherDeductionsD.toNumber(),
    totalDeductions: totalDeductionsD.toNumber(),
  };

  return {
    status,
    pricingDate,
    elapsedHours,
    payableWeightKg: payableD.toNumber(),
    isPayableWeightAssumed,
    harvestedWeightKg: input.harvestedWeightKg,
    basePriceMin: basePriceMinD.toNumber(),
    basePriceMax: basePriceMaxD.toNumber(),
    estimatedPriceMin: adjustedMinD.toNumber(),
    estimatedPriceMax: adjustedMaxD.toNumber(),
    grossRevenueMin: grossMinD.toNumber(),
    grossRevenueMax: grossMaxD.toNumber(),
    netRevenueMin: netMinD.toNumber(),
    netRevenueMax: netMaxD.toNumber(),
    appliedRules,
    unusedObservations,
    recordsUsed: selection.matchedRecords,
    locationMatchLevel: selection.matchLevel,
    costBreakdown,
    limitations: disclaimers,
    calculatedAt: new Date().toISOString(),
    calculationVersion: CALCULATION_VERSION,
  };
}
