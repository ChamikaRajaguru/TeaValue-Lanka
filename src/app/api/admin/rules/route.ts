import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getQualityRules, addQualityRule } from '@/lib/db/client';
import { QualityRule } from '@/lib/engine/types';

export async function GET() {
  try {
    await requireAdmin();
    const rules = await getQualityRules();
    return NextResponse.json({ success: true, rules });
  } catch (error: any) {
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Administrative privileges required.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to retrieve rules.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    if (!body.name || !body.code || body.adjustmentValue === undefined) {
      return NextResponse.json({ error: 'Rule name, unique code, and adjustment value are required.' }, { status: 400 });
    }

    const newRule: QualityRule = {
      id: `rule-${Date.now()}`,
      factoryId: body.factoryId,
      factoryName: body.factoryName,
      name: body.name,
      code: body.code.toUpperCase().replace(/\s+/g, '_'),
      scope: body.scope || (body.factoryId ? 'factory' : 'district'),
      district: body.district,
      conditions: body.conditions || {},
      appliesToBaseBasis: body.appliesToBaseBasis || ['factory-base', 'generic'],
      adjustmentType: body.adjustmentType || 'fixed_per_kg',
      adjustmentValue: Number(body.adjustmentValue),
      effectiveFrom: body.effectiveFrom,
      effectiveTo: body.effectiveTo,
      priority: Number(body.priority) || 1,
      exclusiveGroup: body.exclusiveGroup,
      supportingSource: body.supportingSource,
      verificationStatus: 'verified',
      explanationEn: body.explanationEn || body.name,
      explanationSi: body.explanationSi || body.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await addQualityRule(newRule, admin.email);
    return NextResponse.json({ success: true, rule: saved }, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Administrative privileges required.' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create rule.' }, { status: 500 });
  }
}
