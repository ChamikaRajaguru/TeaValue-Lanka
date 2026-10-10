import { NextResponse } from 'next/server';
import { requireAdmin, promoteUserToAdmin } from '@/lib/auth';
import { getDbConnection, UserRecord } from '@/lib/db/client';

export async function GET() {
  try {
    await requireAdmin();
    const conn = await getDbConnection();
    let users: UserRecord[] = [];

    if (conn.isMongo && conn.db) {
      users = await conn.db.collection<UserRecord>('users').find({}).toArray();
    } else {
      users = [...conn.memory.users];
    }

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Administrative privileges required.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to retrieve users.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const promoted = await promoteUserToAdmin(email, admin.email);
    if (!promoted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `User ${email} promoted to Administrator.` });
  } catch (error: any) {
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Administrative privileges required.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Promotion failed.' }, { status: 500 });
  }
}
