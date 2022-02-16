import express from 'express';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_CONN);

((async () => {
  await client.connect();

  const db = client.db('tcflix');
  const coll = db.collection('items');

  const app = express();
  const port = 3000;

  app.get('/', async (req, res) => {
    res.send(`Movie title : ${(await coll.findOne()).title}`);
  });

  app.listen(process.env.PORT || 3000, () => {
    console.log(`Started on port ${port}`);
  });
})().catch(() => console.log('Error')));
