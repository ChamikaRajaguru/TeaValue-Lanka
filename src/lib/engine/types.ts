export type ElevationCategory = 'low' | 'mid' | 'high' | 'unknown';
export type SurfaceCondition = 'dry' | 'wet' | 'unknown';
export type PackagingCondition = 'loosely_packed' | 'tightly_compressed' | 'unknown';
export type PriceBasis = 'generic' | 'factory-base' | 'quality-specific';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'retired';
export type SourceType = 'factory quote' | 'official publication' | 'verified manual record' | 'other';
export type DiscoveryMethod = 'manual' | 'gemini';
export type UserRole = 'farmer' | 'admin';

export interface AssessmentInput {
  district: string;
  locality?: string;
  growingRegion?: string;
  elevationCategory: ElevationCategory;
  targetFactoryId?: string;
  harvestedWeightKg: number;
  expectedAcceptedWeightKg?: number;
  harvestTimestamp: string; // ISO 8601
  deliveryTimestamp: string; // ISO 8601
  goodLeafPercentage?: number; // 0 - 100
  coarseLeafPercentage?: number; // 0 - 100
  damagedLeafPercentage?: number; // 0 - 100
  surfaceCondition: SurfaceCondition;
  packagingCondition: PackagingCondition;
  isMeasuredSample?: boolean; // measured vs self-reported
  transportCostPerKg?: number; // LKR/kg
  totalTransportCost?: number; // Total LKR
  otherDeductions?: number; // Total LKR
  isTransportCostConfirmed?: boolean;
  notes?: string;
}

export interface MarketPriceRecord {
  id: string;
  productType: 'raw_green_leaf';
  district: string;
  locality?: string;
  growingRegion?: string;
  elevationCategory?: ElevationCategory;
  factoryId?: string;
  factoryName?: string;
  priceBasis: PriceBasis;
  qualityCategoryRef?: string; // e.g. "Super Green", "Grade A Tender", "Standard"
  minPrice: number; // LKR/kg
  maxPrice: number; // LKR/kg
  currency: 'LKR';
  unit: 'kg';
  observedDate: string; // YYYY-MM-DD
  validFrom: string; // YYYY-MM-DD
  validTo: string; // YYYY-MM-DD
  datePrecision: 'day' | 'month';
  sourceName: string;
  sourceUrl?: string;
  sourceRef?: string;
  sourceExcerpt?: string;
  sourceType: SourceType;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  discoveryMethod: DiscoveryMethod;
  demoFlag: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AdjustmentType = 'fixed_per_kg' | 'percentage' | 'quality_category' | 'none';

export interface QualityRule {
  id: string;
  factoryId?: string; // Specific factory or undefined/empty for regional default
  factoryName?: string;
  name: string;
  code: string;
  scope: 'factory' | 'district' | 'general';
  district?: string;
  conditions: {
    minGoodLeaf?: number;
    maxCoarseLeaf?: number;
    maxDamagedLeaf?: number;
    surfaceCondition?: SurfaceCondition;
    packagingCondition?: PackagingCondition;
    maxElapsedHours?: number;
  };
  appliesToBaseBasis: PriceBasis[]; // Only applies if base record has these bases
  adjustmentType: AdjustmentType;
  adjustmentValue: number; // e.g., +8 LKR/kg or -5% or 0
  effectiveFrom: string;
  effectiveTo: string;
  priority: number; // lower number = higher precedence
  exclusiveGroup?: string; // Rules in same group cannot stack
  supportingSource?: string;
  verificationStatus: 'verified' | 'pending' | 'retired';
  explanationEn: string;
  explanationSi: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppliedRuleDetail {
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  adjustmentType: AdjustmentType;
  adjustmentValue: number;
  effectiveAdjustmentPerKg: number;
  explanationEn: string;
  explanationSi: string;
}

export interface UnusedObservation {
  field: string;
  value: string | number;
  reasonEn: string;
  reasonSi: string;
}

export interface CostBreakdown {
  transportCostTotal: number;
  transportCostPerKg: number;
  isTransportEstimated: boolean;
  otherDeductions: number;
  totalDeductions: number;
}

export type EstimateStatus = 'personalized_estimate' | 'market_reference_only' | 'unavailable';

export interface CalculationResult {
  status: EstimateStatus;
  pricingDate: string;
  elapsedHours: number;
  payableWeightKg: number;
  isPayableWeightAssumed: boolean;
  harvestedWeightKg: number;
  
  // Base price from market record
  basePriceMin: number;
  basePriceMax: number;
  
  // After applying rules
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  
  // Revenues
  grossRevenueMin: number;
  grossRevenueMax: number;
  netRevenueMin: number;
  netRevenueMax: number;
  
  // Traceability & Transparency
  appliedRules: AppliedRuleDetail[];
  unusedObservations: UnusedObservation[];
  recordsUsed: MarketPriceRecord[];
  locationMatchLevel: 'exact_factory' | 'locality' | 'district' | 'regional_fallback' | 'none';
  costBreakdown: CostBreakdown;
  limitations: {
    en: string[];
    si: string[];
  };
  calculatedAt: string;
  calculationVersion: string;
}

export interface FactoryProfile {
  id: string;
  name: string;
  code: string;
  district: string;
  locality: string;
  growingRegion?: string;
  elevationCategory: ElevationCategory;
  registeredNumber?: string;
  contactNumber?: string;
  collectionAvailable?: boolean;
  paymentCycleDescription?: string; // e.g. "Monthly on the 10th", "Bi-weekly"
  isActive: boolean;
  demoFlag: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FactoryComparisonItem {
  factoryId: string;
  factoryName: string;
  district: string;
  locality: string;
  elevationCategory: ElevationCategory;
  hasEligiblePrice: boolean;
  priceMin?: number;
  priceMax?: number;
  qualityCategory?: string;
  transportCost?: number;
  otherDeductions?: number;
  netRevenueMin?: number;
  netRevenueMax?: number;
  collectionAvailable?: boolean;
  paymentCycle?: string;
  sourceName?: string;
  sourceDate?: string;
  recordVerificationStatus?: VerificationStatus;
  rankingScore?: number;
}

export interface SavedEstimate {
  id: string;
  userId: string;
  createdAt: string;
  inputSnapshot: AssessmentInput;
  resultSnapshot: CalculationResult;
  targetFactorySnapshot?: FactoryProfile;
  notes?: string;
}
