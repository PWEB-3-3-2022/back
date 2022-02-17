import { MongoClient } from 'mongodb';

// Defaults to a mongodb instance on localhost
export const client = new MongoClient(
  process.env.MONGODB_CONN || 'mongodb://localhost:27017/tcflix',
);

// Variables should not be used until initialization

export let db;

export let itemsColl;

// Initialize DB connection
export async function initializeDBConn() {
  await client.connect();
  // Database name is inferred from connection string
  db = client.db();
  itemsColl = db.collection('items');
}
