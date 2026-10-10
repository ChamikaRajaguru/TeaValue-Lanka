import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { discoverRawLeafPrices } from '@/lib/gemini/service';
import { addMarketPriceRecord, createAuditLog } from '@/lib/db/client';

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    const district = body.district || 'Galle';
    const factoryName = body.factoryName;
    const yearMonth = body.yearMonth;

    const discovery = await discoverRawLeafPrices({ district, factoryName, yearMonth });

    // If candidates were found, insert them as PENDING records
    if (discovery.candidates.length > 0) {
      for (const cand of discovery.candidates) {
        await addMarketPriceRecord(cand);
      }

      await createAuditLog({
        id: `audit-${Date.now()}`,
        userId: admin.id,
        userEmail: admin.email,
        action: 'gemini_discovery',
        targetType: 'market_price',
        targetId: `batch-${discovery.candidates.length}`,
        details: { district, count: discovery.candidates.length },
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: discovery.success,
      message: discovery.message,
      candidatesCount: discovery.candidates.length,
      candidates: discovery.candidates,
    });
  } catch (error: any) {
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Administrative privileges required.' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Gemini discovery failed.' }, { status: 500 });
  }
}
