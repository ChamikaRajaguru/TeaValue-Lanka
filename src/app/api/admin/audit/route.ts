import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAuditLogs } from '@/lib/db/client';

export async function GET() {
  try {
    await requireAdmin();
    const logs = await getAuditLogs();
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Administrative privileges required.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to retrieve audit logs.' }, { status: 500 });
  }
}
