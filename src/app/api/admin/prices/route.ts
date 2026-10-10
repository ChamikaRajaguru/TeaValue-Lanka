import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getMarketPrices, addMarketPriceRecord, updateMarketPriceStatus } from '@/lib/db/client';
import { MarketPriceRecord } from '@/lib/engine/types';

export async function GET() {
  try {
    await requireAdmin();
    const prices = await getMarketPrices();
    return NextResponse.json({ success: true, prices });
  } catch (error: any) {
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Administrative privileges required.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to retrieve prices.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    const minPrice = Number(body.minPrice);
    const maxPrice = Number(body.maxPrice);

    if (minPrice <= 0 || maxPrice < minPrice) {
      return NextResponse.json({ error: 'Price must be positive and minimum cannot exceed maximum.' }, { status: 400 });
    }

    const newRecord: MarketPriceRecord = {
      id: `price-adm-${Date.now()}`,
      productType: 'raw_green_leaf',
      district: body.district,
      locality: body.locality,
      growingRegion: body.growingRegion,
      elevationCategory: body.elevationCategory,
      factoryId: body.factoryId,
      factoryName: body.factoryName,
      priceBasis: body.priceBasis || 'factory-base',
      qualityCategoryRef: body.qualityCategoryRef,
      minPrice,
      maxPrice,
      currency: 'LKR',
      unit: 'kg',
      observedDate: body.observedDate || new Date().toISOString().split('T')[0],
      validFrom: body.validFrom,
      validTo: body.validTo,
      datePrecision: body.datePrecision || 'month',
      sourceName: body.sourceName,
      sourceUrl: body.sourceUrl,
      sourceRef: body.sourceRef,
      sourceExcerpt: body.sourceExcerpt,
      sourceType: body.sourceType || 'verified manual record',
      verificationStatus: 'verified', // Admin direct entry is verified
      verifiedBy: admin.email,
      verifiedAt: new Date().toISOString(),
      discoveryMethod: 'manual',
      demoFlag: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await addMarketPriceRecord(newRecord);
    return NextResponse.json({ success: true, price: saved }, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Administrative privileges required.' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create price record.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    const { id, status } = await request.json();

    if (!id || !['verified', 'rejected', 'retired'].includes(status)) {
      return NextResponse.json({ error: 'Invalid record ID or target verification status.' }, { status: 400 });
    }

    await updateMarketPriceStatus(id, status, admin.email);
    return NextResponse.json({ success: true, message: `Price record updated to ${status}.` });
  } catch (error: any) {
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Administrative privileges required.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to update record status.' }, { status: 500 });
  }
}
