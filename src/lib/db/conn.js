import { MongoClient, ObjectId } from 'mongodb';

// Defaults to a mongodb instance on localhost
export const client = new MongoClient(
  process.env.MONGODB_CONN || 'mongodb://127.0.0.1:27017/tcflix?readPreference=primary&appname=back&directConnection=true&ssl=false',
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

export function toObjectId(id) {
  return new ObjectId(id);
}
