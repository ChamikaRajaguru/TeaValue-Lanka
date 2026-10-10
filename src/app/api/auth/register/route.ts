import { NextResponse } from 'next/server';
import { registerFarmer } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await registerFarmer({
      name: body.name,
      email: body.email,
      password: body.password,
      district: body.district,
      locality: body.locality,
      elevationCategory: body.elevationCategory,
      preferredLanguage: body.preferredLanguage,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: result.user }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
