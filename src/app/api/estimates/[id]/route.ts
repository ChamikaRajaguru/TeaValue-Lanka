import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { getEstimateById, deleteUserEstimate } from '@/lib/db/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    // Strict ownership verification!
    const estimate = await getEstimateById(id, user.id);
    if (!estimate) {
      return NextResponse.json({ error: 'Estimate not found or unauthorized.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, estimate });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch estimate.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const deleted = await deleteUserEstimate(id, user.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Estimate not found or unauthorized to delete.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Estimate deleted successfully.' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete estimate.' }, { status: 500 });
  }
}
