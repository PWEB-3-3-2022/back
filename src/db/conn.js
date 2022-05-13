import { MongoClient } from 'mongodb';

// Defaults to a mongodb instance on localhost
export const client = new MongoClient(
  process.env.MONGODB_CONN || '',
);

// Variables should not be used until initialization

export let db;

export let mediaColl;
export let userColl;

// Initialize DB connection
export async function initializeDBConn() {
  await client.connect();
  // Database name is inferred from connection string
  db = client.db();
  mediaColl = db.collection('media');
  userColl = db.collection('users');
}
