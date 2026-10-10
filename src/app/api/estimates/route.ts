import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { getUserEstimates } from '@/lib/db/client';

export async function GET() {
  try {
    const user = await requireUser();
    const estimates = await getUserEstimates(user.id);
    return NextResponse.json({ success: true, estimates });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Please log in to view saved estimates.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to retrieve estimates.' }, { status: 500 });
  }
}
