import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'paydate_tracker';

if (!uri) {
  // Thrown lazily at request time (not at build time) so the app can still
  // build without a database configured yet.
  console.warn(
    'MONGODB_URI is not set. Add it to .env.local before using the app.'
  );
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In dev, use a global variable so the value survives Next.js hot reloads.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri || '');
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri || '');
  clientPromise = client.connect();
}

export async function getDb() {
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Create .env.local from .env.local.example and add your connection string.'
    );
  }
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}
