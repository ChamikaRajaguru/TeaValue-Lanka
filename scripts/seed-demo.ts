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

    console.log('Demo seed completed successfully! Real records were left intact.');
  } finally {
    await client.close();
  }
}

seedDemoData().catch((err) => {
  console.error('Demo seeding failed:', err);
  process.exit(1);
});
