import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { getDbConnection, UserRecord, createAuditLog } from '../db/client';

export interface AuthSession {
  user: UserRecord;
  token: string;
  expiresAt: string;
}

// In-memory sessions store fallback persisted across Next.js reloads
const memorySessions: Map<string, AuthSession> =
  (globalThis as any).__teaValueMemorySessions || new Map<string, AuthSession>();
(globalThis as any).__teaValueMemorySessions = memorySessions;

// Secure hashing using standard Node.js crypto
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
  } catch (err) {
    return false;
  }
}

// Store credentials in db
export interface StoredAccount {
  userId: string;
  email: string;
  passwordHash: string;
}

const memoryAccounts: Map<string, StoredAccount> =
  (globalThis as any).__teaValueMemoryAccounts ||
  new Map<string, StoredAccount>([
    [
      'superadmin@gmail.com',
      {
        userId: 'usr-superadmin-1',
        email: 'superadmin@gmail.com',
        passwordHash: hashPassword('admin123'),
      },
    ],
    [
      'admin@teavalue.lk',
      {
        userId: 'usr-admin-1',
        email: 'admin@teavalue.lk',
        passwordHash: hashPassword('AdminPass2026!'),
      },
    ],
    [
      'farmer@teavalue.lk',
      {
        userId: 'usr-farmer-1',
        email: 'farmer@teavalue.lk',
        passwordHash: hashPassword('FarmerPass2026!'),
      },
    ],
  ]);
(globalThis as any).__teaValueMemoryAccounts = memoryAccounts;

export async function registerFarmer(data: {
  name: string;
  email: string;
  password: string;
  district?: string;
  locality?: string;
  elevationCategory?: string;
  preferredLanguage?: 'en' | 'si';
}): Promise<{ success: boolean; user?: UserRecord; error?: string }> {
  const email = data.email.toLowerCase().trim();

  // Validate format
  if (!email || !data.password || data.password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }

  const conn = await getDbConnection();

  // Check if exists
  if (conn.isMongo && conn.db) {
    const existing = await conn.db.collection('users').findOne({ email });
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }
  } else {
    if (conn.memory.users.some((u) => u.email === email)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }
  }

  // CRITICAL REQUIREMENT: Registration MUST ALWAYS create a farmer account. Never accept an admin role!
  const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newUser: UserRecord = {
    id: userId,
    name: data.name.trim(),
    email,
    role: 'farmer', // strictly farmer!
    district: data.district || 'Galle',
    locality: data.locality || '',
    elevationCategory: data.elevationCategory || 'low',
    preferredLanguage: data.preferredLanguage || 'en',
    createdAt: new Date().toISOString(),
    status: 'active',
  };

  const passwordHash = hashPassword(data.password);

  if (conn.isMongo && conn.db) {
    await conn.db.collection('users').insertOne(newUser);
    await conn.db.collection('accounts').insertOne({
      userId,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    });
  } else {
    conn.memory.users.push(newUser);
    memoryAccounts.set(email, { userId, email, passwordHash });
  }

  return { success: true, user: newUser };
}

export async function loginUser(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  const email = emailInput.toLowerCase().trim();
  const conn = await getDbConnection();

  let user: UserRecord | null = null;
  let storedAccount: StoredAccount | null = null;

  if (conn.isMongo && conn.db) {
    user = await conn.db.collection<UserRecord>('users').findOne({ email });
    storedAccount = await conn.db.collection<StoredAccount>('accounts').findOne({ email });
  } else {
    user = conn.memory.users.find((u) => u.email === email) || null;
    storedAccount = memoryAccounts.get(email) || null;
  }

  if (!user || !storedAccount) {
    return { success: false, error: 'Invalid email address or password.' };
  }

  if (user.status === 'suspended') {
    return { success: false, error: 'Your account has been deactivated. Please contact support.' };
  }

  if (!verifyPassword(passwordInput, storedAccount.passwordHash)) {
    return { success: false, error: 'Invalid email address or password.' };
  }

  // Create session
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  const session: AuthSession = {
    user,
    token,
    expiresAt,
  };

  if (conn.isMongo && conn.db) {
    await conn.db.collection('sessions').insertOne(session);
  } else {
    memorySessions.set(token, session);
  }

  return { success: true, session };
}

export async function getCurrentUser(): Promise<UserRecord | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('teavalue_session')?.value;
    if (!token) return null;

    const conn = await getDbConnection();

    let session: AuthSession | null = null;
    if (conn.isMongo && conn.db) {
      session = await conn.db.collection<AuthSession>('sessions').findOne({ token });
    } else {
      session = memorySessions.get(token) || null;
    }

    if (!session) return null;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      return null;
    }

    // Always fetch fresh user record from database so role/status changes reflect immediately
    if (conn.isMongo && conn.db) {
      const freshUser = await conn.db.collection<UserRecord>('users').findOne({ id: session.user.id });
      if (freshUser) return freshUser;
    } else {
      const freshUser = conn.memory.users.find((u) => u.id === session.user.id);
      if (freshUser) return freshUser;
    }

    return session.user;
  } catch (err) {
    return null;
  }
}

export async function requireUser(): Promise<UserRecord> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin(): Promise<UserRecord> {
  const user = await requireUser();
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Administrative access required');
  }
  return user;
}

export async function promoteUserToAdmin(email: string, promotedBy: string = 'cli'): Promise<boolean> {
  const conn = await getDbConnection();
  const normalizedEmail = email.toLowerCase().trim();

  if (conn.isMongo && conn.db) {
    const res = await conn.db.collection('users').updateOne(
      { email: normalizedEmail },
      { $set: { role: 'admin' } }
    );
    if (res.matchedCount > 0) {
      await createAuditLog({
        id: `audit-${Date.now()}`,
        userId: promotedBy,
        userEmail: promotedBy,
        action: 'promote_user',
        targetType: 'user',
        targetId: normalizedEmail,
        details: { newRole: 'admin' },
        timestamp: new Date().toISOString(),
      });
      return true;
    }
    return false;
  }

  const user = conn.memory.users.find((u) => u.email === normalizedEmail);
  if (user) {
    user.role = 'admin';
    await createAuditLog({
      id: `audit-${Date.now()}`,
      userId: promotedBy,
      userEmail: promotedBy,
      action: 'promote_user',
      targetType: 'user',
      targetId: user.id,
      details: { newRole: 'admin' },
      timestamp: new Date().toISOString(),
    });
    return true;
  }
  return false;
}
