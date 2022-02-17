import { MongoClient } from 'mongodb';

export const client = new MongoClient(process.env.MONGODB_CONN);

export let db;

export let itemsColl;

// Variables should not be used until initialization
export async function initializeDBConn() {
  await client.connect();
  db = client.db('tcflix');
  itemsColl = db.collection('items');
}
