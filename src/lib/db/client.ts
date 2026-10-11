import dns from 'node:dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
import { MongoClient, Db } from 'mongodb';
import {
  FactoryProfile,
  MarketPriceRecord,
  QualityRule,
  SavedEstimate,
} from '../engine/types';
import {
  DEMO_FACTORIES,
  DEMO_MARKET_PRICES,
  DEMO_QUALITY_RULES,
} from './seed-data';

// Audit Log interface
export interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: 'verify_price' | 'retire_price' | 'reject_price' | 'add_price' | 'edit_rule' | 'add_rule' | 'add_factory' | 'promote_user' | 'gemini_discovery';
  targetType: 'market_price' | 'quality_rule' | 'factory' | 'user';
  targetId: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'admin';
  district?: string;
  locality?: string;
  elevationCategory?: string;
  preferredLanguage?: 'en' | 'si';
  createdAt: string;
  status: 'active' | 'suspended';
}

// In-Memory Database Store for DEMO_MODE or when MongoDB is disconnected
class MemoryDbStore {
  factories: FactoryProfile[] = [...DEMO_FACTORIES];
  marketPrices: MarketPriceRecord[] = [...DEMO_MARKET_PRICES];
  qualityRules: QualityRule[] = [...DEMO_QUALITY_RULES];
  estimates: SavedEstimate[] = [];
  auditLogs: AuditLogEntry[] = [
    {
      id: 'audit-init-01',
      userId: 'system-admin',
      userEmail: 'admin@teavalue.lk',
      action: 'verify_price',
      targetType: 'market_price',
      targetId: 'price-demo-01',
      details: { note: 'Initial system baseline prices verified' },
      timestamp: '2026-10-01T08:00:00Z',
    },
  ];
  users: UserRecord[] = [
    {
      id: 'usr-superadmin-1',
      name: 'Super Admin',
      email: 'superadmin@gmail.com',
      role: 'admin',
      district: 'Galle',
      locality: 'Neluwa',
      elevationCategory: 'low',
      preferredLanguage: 'en',
      createdAt: '2026-10-11T00:00:00Z',
      status: 'active',
    },
    {
      id: 'usr-admin-1',
      name: 'System Admin',
      email: 'admin@teavalue.lk',
      role: 'admin',
      district: 'Galle',
      locality: 'Neluwa',
      elevationCategory: 'low',
      preferredLanguage: 'en',
      createdAt: '2026-09-01T00:00:00Z',
      status: 'active',
    },
    {
      id: 'usr-farmer-1',
      name: 'Sunil Rajapaksa',
      email: 'farmer@teavalue.lk',
      role: 'farmer',
      district: 'Galle',
      locality: 'Neluwa',
      elevationCategory: 'low',
      preferredLanguage: 'si',
      createdAt: '2026-10-01T00:00:00Z',
      status: 'active',
    },
  ];
}

// Singleton state
const globalStore: MemoryDbStore = (global as any).__teaValueMemoryStore || new MemoryDbStore();
if (process.env.NODE_ENV !== 'production') {
  (global as any).__teaValueMemoryStore = globalStore;
}

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isMongoConnected = false;

export async function getDbConnection(): Promise<{ isMongo: boolean; db: Db | null; memory: MemoryDbStore }> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'teavalue_lanka';

  if (!uri || process.env.DEMO_MODE === 'true') {
    return { isMongo: false, db: null, memory: globalStore };
  }

  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 3000,
      });
      await mongoClient.connect();
      mongoDb = mongoClient.db(dbName);
      isMongoConnected = true;
    }
    return { isMongo: true, db: mongoDb, memory: globalStore };
  } catch (error) {
    console.warn('MongoDB connection failed; falling back gracefully to memory store:', error);
    return { isMongo: false, db: null, memory: globalStore };
  }
}

// ============================================================================
// REPOSITORY METHODS
// ============================================================================

export async function getFactories(options: { district?: string; onlyActive?: boolean } = {}) {
  const conn = await getDbConnection();
  if (conn.isMongo && conn.db) {
    const query: any = {};
    if (options.district) query.district = { $regex: new RegExp(`^${options.district}$`, 'i') };
    if (options.onlyActive) query.isActive = true;
    return await conn.db.collection<FactoryProfile>('factories').find(query).toArray();
  }

  let list = [...conn.memory.factories];
  if (options.district) {
    list = list.filter((f) => f.district.toLowerCase() === options.district?.toLowerCase());
  }
  if (options.onlyActive) {
    list = list.filter((f) => f.isActive);
  }
  return list;
}

export async function getMarketPrices(options: {
  district?: string;
  factoryId?: string;
  status?: string;
  pricingDate?: string;
} = {}) {
  const conn = await getDbConnection();
  if (conn.isMongo && conn.db) {
    const query: any = {};
    if (options.district) query.district = { $regex: new RegExp(`^${options.district}$`, 'i') };
    if (options.factoryId) query.factoryId = options.factoryId;
    if (options.status) query.verificationStatus = options.status;
    return await conn.db.collection<MarketPriceRecord>('marketPrices').find(query).toArray();
  }

  let list = [...conn.memory.marketPrices];
  if (options.district) {
    list = list.filter((p) => p.district.toLowerCase() === options.district?.toLowerCase());
  }
  if (options.factoryId) {
    list = list.filter((p) => p.factoryId === options.factoryId);
  }
  if (options.status) {
    list = list.filter((p) => p.verificationStatus === options.status);
  }
  return list;
}

export async function getQualityRules(options: {
  factoryId?: string;
  district?: string;
  status?: string;
} = {}) {
  const conn = await getDbConnection();
  if (conn.isMongo && conn.db) {
    const query: any = {};
    if (options.status) query.verificationStatus = options.status;
    return await conn.db.collection<QualityRule>('qualityRules').find(query).toArray();
  }

  let list = [...conn.memory.qualityRules];
  if (options.status) {
    list = list.filter((r) => r.verificationStatus === options.status);
  }
  return list;
}

export async function saveEstimateRecord(estimate: SavedEstimate) {
  const conn = await getDbConnection();
  if (conn.isMongo && conn.db) {
    await conn.db.collection('priceEstimates').insertOne(estimate);
    return estimate;
  }

  conn.memory.estimates.unshift(estimate);
  return estimate;
}

export async function getUserEstimates(userId: string) {
  const conn = await getDbConnection();
  if (conn.isMongo && conn.db) {
    return await conn.db
      .collection<SavedEstimate>('priceEstimates')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  return conn.memory.estimates.filter((e) => e.userId === userId);
}

export async function getEstimateById(id: string, userId?: string) {
  const conn = await getDbConnection();
  let estimate: SavedEstimate | null = null;
  if (conn.isMongo && conn.db) {
    estimate = await conn.db.collection<SavedEstimate>('priceEstimates').findOne({ id });
  } else {
    estimate = conn.memory.estimates.find((e) => e.id === id) || null;
  }

  if (!estimate) return null;
  // If userId is provided, enforce ownership!
  if (userId && estimate.userId !== userId) {
    return null; // unauthorized access rejected
  }
  return estimate;
}

export async function deleteUserEstimate(id: string, userId: string) {
  const conn = await getDbConnection();
  if (conn.isMongo && conn.db) {
    const res = await conn.db.collection('priceEstimates').deleteOne({ id, userId });
    return res.deletedCount > 0;
  }

  const idx = conn.memory.estimates.findIndex((e) => e.id === id && e.userId === userId);
  if (idx !== -1) {
    conn.memory.estimates.splice(idx, 1);
    return true;
  }
  return false;
}

export async function addMarketPriceRecord(record: MarketPriceRecord) {
  const conn = await getDbConnection();
  if (conn.isMongo && conn.db) {
    await conn.db.collection('marketPrices').insertOne(record);
    return record;
  }
  conn.memory.marketPrices.unshift(record);
  return record;
}

export async function updateMarketPriceStatus(
  id: string,
  status: 'verified' | 'rejected' | 'retired',
  verifiedBy: string
) {
  const conn = await getDbConnection();
  const timestamp = new Date().toISOString();
  if (conn.isMongo && conn.db) {
    await conn.db.collection('marketPrices').updateOne(
      { id },
      {
        $set: {
          verificationStatus: status,
          verifiedBy,
          verifiedAt: timestamp,
          updatedAt: timestamp,
        },
      }
    );
  } else {
    const item = conn.memory.marketPrices.find((p) => p.id === id);
    if (item) {
      item.verificationStatus = status;
      item.verifiedBy = verifiedBy;
      item.verifiedAt = timestamp;
      item.updatedAt = timestamp;
    }
  }

  // Audit log
  await createAuditLog({
    id: `audit-${Date.now()}`,
    userId: verifiedBy,
    userEmail: 'admin@teavalue.lk',
    action: status === 'verified' ? 'verify_price' : status === 'retired' ? 'retire_price' : 'reject_price',
    targetType: 'market_price',
    targetId: id,
    details: { newStatus: status },
    timestamp,
  });
}

export async function addQualityRule(rule: QualityRule, userEmail: string = 'admin@teavalue.lk') {
  const conn = await getDbConnection();
  if (conn.isMongo && conn.db) {
    await conn.db.collection('qualityRules').insertOne(rule);
  } else {
    conn.memory.qualityRules.unshift(rule);
  }

  await createAuditLog({
    id: `audit-${Date.now()}`,
    userId: 'admin',
    userEmail,
    action: 'add_rule',
    targetType: 'quality_rule',
    targetId: rule.id,
    details: { code: rule.code, name: rule.name },
    timestamp: new Date().toISOString(),
  });
  return rule;
}

export async function addFactory(factory: FactoryProfile, userEmail: string = 'admin@teavalue.lk') {
  const conn = await getDbConnection();
  if (conn.isMongo && conn.db) {
    await conn.db.collection('factories').insertOne(factory);
  } else {
    conn.memory.factories.unshift(factory);
  }

  await createAuditLog({
    id: `audit-${Date.now()}`,
    userId: 'admin',
    userEmail,
    action: 'add_factory',
    targetType: 'factory',
    targetId: factory.id,
    details: { name: factory.name, district: factory.district },
    timestamp: new Date().toISOString(),
  });
  return factory;
}

export async function createAuditLog(log: AuditLogEntry) {
  const conn = await getDbConnection();
  if (conn.isMongo && conn.db) {
    await conn.db.collection('auditLogs').insertOne(log);
  } else {
    conn.memory.auditLogs.unshift(log);
  }
}

export async function getAuditLogs() {
  const conn = await getDbConnection();
  if (conn.isMongo && conn.db) {
    return await conn.db
      .collection<AuditLogEntry>('auditLogs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
  }
  return [...conn.memory.auditLogs];
}
