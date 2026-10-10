import { config } from 'dotenv';
config({ path: '.env.local' });
import dns from 'node:dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
import { MongoClient } from 'mongodb';
import { DEMO_FACTORIES, DEMO_MARKET_PRICES, DEMO_QUALITY_RULES } from '../src/lib/db/seed-data';

async function seedDemoData() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'teavalue_lanka';

  if (!uri) {
    console.log('No MONGODB_URI found. Memory store will automatically use seed data when DEMO_MODE=true.');
    return;
  }

  console.log(`Connecting to MongoDB at ${uri}...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    console.log('Seeding Factories (idempotent, upsert by ID)...');
    for (const f of DEMO_FACTORIES) {
      await db.collection('factories').updateOne(
        { id: f.id },
        { $setOnInsert: f },
        { upsert: true }
      );
    }

    console.log('Seeding Market Price Records (idempotent, upsert by ID)...');
    for (const p of DEMO_MARKET_PRICES) {
      await db.collection('marketPrices').updateOne(
        { id: p.id },
        { $setOnInsert: p },
        { upsert: true }
      );
    }

    console.log('Seeding Quality Rules (idempotent, upsert by ID)...');
    for (const r of DEMO_QUALITY_RULES) {
      await db.collection('qualityRules').updateOne(
        { id: r.id },
        { $setOnInsert: r },
        { upsert: true }
      );
    }

    // Create Indexes
    console.log('Creating database indexes for query performance...');
    await db.collection('factories').createIndex({ district: 1 });
    await db.collection('marketPrices').createIndex({ district: 1, validFrom: 1, validTo: 1, verificationStatus: 1 });
    await db.collection('marketPrices').createIndex({ factoryId: 1 });
    await db.collection('priceEstimates').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('auditLogs').createIndex({ timestamp: -1 });

    // Seed Initial Users for MongoDB Atlas
    console.log('Seeding initial Demo Admin and Farmer accounts...');
    const { hashPassword } = await import('../src/lib/auth/index');
    await db.collection('users').updateOne(
      { email: 'admin@teavalue.lk' },
      {
        $setOnInsert: {
          id: 'usr-admin-1',
          name: 'System Admin',
          email: 'admin@teavalue.lk',
          role: 'admin',
          district: 'Galle',
          locality: 'Neluwa',
          elevationCategory: 'low',
          preferredLanguage: 'en',
          createdAt: new Date().toISOString(),
          status: 'active',
        },
      },
      { upsert: true }
    );

    await db.collection('accounts').updateOne(
      { email: 'admin@teavalue.lk' },
      {
        $setOnInsert: {
          userId: 'usr-admin-1',
          email: 'admin@teavalue.lk',
          passwordHash: hashPassword('AdminPass2026!'),
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    await db.collection('users').updateOne(
      { email: 'farmer@teavalue.lk' },
      {
        $setOnInsert: {
          id: 'usr-farmer-1',
          name: 'Sunil Rajapaksa',
          email: 'farmer@teavalue.lk',
          role: 'farmer',
          district: 'Galle',
          locality: 'Neluwa',
          elevationCategory: 'low',
          preferredLanguage: 'si',
          createdAt: new Date().toISOString(),
          status: 'active',
        },
      },
      { upsert: true }
    );

    await db.collection('accounts').updateOne(
      { email: 'farmer@teavalue.lk' },
      {
        $setOnInsert: {
          userId: 'usr-farmer-1',
          email: 'farmer@teavalue.lk',
          passwordHash: hashPassword('FarmerPass2026!'),
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    console.log('Demo seed completed successfully! Real records were left intact.');
  } finally {
    await client.close();
  }
}

seedDemoData().catch((err) => {
  console.error('Demo seeding failed:', err);
  process.exit(1);
});
