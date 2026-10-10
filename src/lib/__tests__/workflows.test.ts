import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerFarmer,
  loginUser,
  promoteUserToAdmin,
} from '../auth';
import {
  calculateEstimate,
} from '../engine/calculator';
import {
  AssessmentInput,
  MarketPriceRecord,
  QualityRule,
  SavedEstimate,
} from '../engine/types';
import {
  saveEstimateRecord,
  getEstimateById,
  getUserEstimates,
  deleteUserEstimate,
  addMarketPriceRecord,
  updateMarketPriceStatus,
  getMarketPrices,
} from '../db/client';

describe('End-to-End Workflow & Security Tests', () => {
  const uniqueId = Date.now();
  const testFarmerEmail = `farmer-${uniqueId}@test.lk`;
  const otherFarmerEmail = `other-${uniqueId}@test.lk`;

  it('1. Farmer registration strictly creates a farmer account (never admin)', async () => {
    const regResult = await registerFarmer({
      name: 'Chaminda Silva',
      email: testFarmerEmail,
      password: 'StrongPassword2026!',
      district: 'Galle',
      locality: 'Neluwa',
    });

    expect(regResult.success).toBe(true);
    expect(regResult.user).toBeDefined();
    expect(regResult.user?.role).toBe('farmer'); // Strictly farmer!

    // Duplicate email registration rejected
    const dupResult = await registerFarmer({
      name: 'Chaminda Duplicate',
      email: testFarmerEmail,
      password: 'StrongPassword2026!',
    });
    expect(dupResult.success).toBe(false);
    expect(dupResult.error).toContain('already exists');
  });

  it('2. Farmer login verifies credentials and creates session', async () => {
    const loginFail = await loginUser(testFarmerEmail, 'WrongPassword');
    expect(loginFail.success).toBe(false);

    const loginSuccess = await loginUser(testFarmerEmail, 'StrongPassword2026!');
    expect(loginSuccess.success).toBe(true);
    expect(loginSuccess.session).toBeDefined();
    expect(loginSuccess.session?.user.email).toBe(testFarmerEmail);
  });

  it('3. Estimate creation using controlled verified data produces explainable output', async () => {
    const controlledPrice: MarketPriceRecord = {
      id: `price-ctrl-${uniqueId}`,
      productType: 'raw_green_leaf',
      district: 'Galle',
      locality: 'Neluwa',
      priceBasis: 'factory-base',
      minPrice: 250,
      maxPrice: 260,
      currency: 'LKR',
      unit: 'kg',
      observedDate: '2026-10-01',
      validFrom: '2026-10-01',
      validTo: '2026-10-31',
      datePrecision: 'month',
      sourceName: 'Neluwa Test Notice',
      sourceType: 'factory quote',
      verificationStatus: 'verified',
      discoveryMethod: 'manual',
      demoFlag: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const controlledRule: QualityRule = {
      id: `rule-ctrl-${uniqueId}`,
      name: 'Controlled Pluck Bonus',
      code: 'CTRL_BONUS',
      scope: 'district',
      district: 'Galle',
      conditions: { minGoodLeaf: 70 },
      appliesToBaseBasis: ['factory-base'],
      adjustmentType: 'fixed_per_kg',
      adjustmentValue: 15,
      effectiveFrom: '2026-10-01',
      effectiveTo: '2026-10-31',
      priority: 1,
      verificationStatus: 'verified',
      explanationEn: 'Bonus of 15 LKR/kg for >= 70% tender flush',
      explanationSi: '70% ට වැඩි ළපටි දළු සඳහා රු. 15 ක ප්‍රසාද මුදලක්',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const input: AssessmentInput = {
      district: 'Galle',
      locality: 'Neluwa',
      elevationCategory: 'low',
      harvestedWeightKg: 100,
      expectedAcceptedWeightKg: 95, // 5 kg water deduction
      harvestTimestamp: '2026-10-10T06:00:00Z',
      deliveryTimestamp: '2026-10-10T09:30:00Z', // 3.5 hours
      goodLeafPercentage: 75,
      surfaceCondition: 'dry',
      packagingCondition: 'loosely_packed',
      transportCostPerKg: 5,
      isTransportCostConfirmed: true,
    };

    const result = calculateEstimate(input, [controlledPrice], [controlledRule], {
      pricingDate: '2026-10-10',
    });

    expect(result.status).toBe('personalized_estimate');
    // Base 250 - 260 + 15 rule = 265 - 275 LKR/kg
    expect(result.estimatedPriceMin).toBe(265);
    expect(result.estimatedPriceMax).toBe(275);
    expect(result.payableWeightKg).toBe(95);
    expect(result.isPayableWeightAssumed).toBe(false);

    // Gross: 95 * 265 = 25,175; 95 * 275 = 26,125
    expect(result.grossRevenueMin).toBe(25175);
    expect(result.grossRevenueMax).toBe(26125);

    // Transport: 95 * 5 = 475
    // Net: 25,175 - 475 = 24,700; 26,125 - 475 = 25,650
    expect(result.netRevenueMin).toBe(24700);
    expect(result.netRevenueMax).toBe(25650);
    expect(result.appliedRules).toHaveLength(1);
    expect(result.appliedRules[0].ruleCode).toBe('CTRL_BONUS');

    // Save snapshot
    const savedEstimate: SavedEstimate = {
      id: `est-snap-${uniqueId}`,
      userId: `usr-farmer-${uniqueId}`,
      createdAt: new Date().toISOString(),
      inputSnapshot: input,
      resultSnapshot: result,
    };

    await saveEstimateRecord(savedEstimate);

    // 4. Ownership enforcement: User can access own, but another farmer is rejected
    const retrievedByOwner = await getEstimateById(`est-snap-${uniqueId}`, `usr-farmer-${uniqueId}`);
    expect(retrievedByOwner).not.toBeNull();
    expect(retrievedByOwner?.id).toBe(`est-snap-${uniqueId}`);

    const retrievedByStranger = await getEstimateById(`est-snap-${uniqueId}`, `usr-other-${uniqueId}`);
    expect(retrievedByStranger).toBeNull(); // Unauthorized rejected!
  });

  it('5. Admin publishing & verifying a price record makes it active', async () => {
    const pendingRecord: MarketPriceRecord = {
      id: `price-pend-${uniqueId}`,
      productType: 'raw_green_leaf',
      district: 'Matara',
      priceBasis: 'generic',
      minPrice: 248,
      maxPrice: 258,
      currency: 'LKR',
      unit: 'kg',
      observedDate: '2026-10-01',
      validFrom: '2026-10-01',
      validTo: '2026-10-31',
      datePrecision: 'month',
      sourceName: 'Pending Test Circular',
      sourceType: 'other',
      verificationStatus: 'pending', // Pending
      discoveryMethod: 'manual',
      demoFlag: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addMarketPriceRecord(pendingRecord);

    // Update status to verified by Admin
    await updateMarketPriceStatus(`price-pend-${uniqueId}`, 'verified', 'admin@teavalue.lk');

    const allPrices = await getMarketPrices({ district: 'Matara' });
    const verifiedItem = allPrices.find((p) => p.id === `price-pend-${uniqueId}`);
    expect(verifiedItem?.verificationStatus).toBe('verified');
    expect(verifiedItem?.verifiedBy).toBe('admin@teavalue.lk');
  });

  it('6. Admin promotion promotes a registered farmer to administrator', async () => {
    const success = await promoteUserToAdmin(testFarmerEmail, 'e2e-test');
    expect(success).toBe(true);

    // Verify through login
    const login = await loginUser(testFarmerEmail, 'StrongPassword2026!');
    expect(login.session?.user.role).toBe('admin');
  });
});
