import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getFactories, addFactory } from '@/lib/db/client';
import { FactoryProfile } from '@/lib/engine/types';

export async function GET() {
  try {
    await requireAdmin();
    const factories = await getFactories();
    return NextResponse.json({ success: true, factories });
  } catch (error: any) {
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Administrative privileges required.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to retrieve factories.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    if (!body.name || !body.district || !body.locality) {
      return NextResponse.json({ error: 'Factory name, district, and locality are required.' }, { status: 400 });
    }

    const newFactory: FactoryProfile = {
      id: `fac-${Date.now()}`,
      name: body.name,
      code: body.code || `FAC-${body.district.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 100)}`,
      district: body.district,
      locality: body.locality,
      growingRegion: body.growingRegion,
      elevationCategory: body.elevationCategory || 'low',
      registeredNumber: body.registeredNumber,
      contactNumber: body.contactNumber,
      collectionAvailable: !!body.collectionAvailable,
      paymentCycleDescription: body.paymentCycleDescription || 'Monthly settlement',
      isActive: true,
      demoFlag: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await addFactory(newFactory, admin.email);
    return NextResponse.json({ success: true, factory: saved }, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Administrative privileges required.' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create factory.' }, { status: 500 });
  }
}
