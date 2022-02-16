import express from 'express';
import { MongoClient } from 'mongodb';

const client = new MongoClient(
  'mongodb://127.0.0.1:27017/tcflix?retryWrites=true&writeConcern=majority',
);

((async () => {
  await client.connect();

  const db = client.db('tcflix');
  const coll = db.collection('items');

  const app = express();
  const port = 3000;

  app.get('/', async (req, res) => {
    res.send(`Hello World! ${(await coll.findOne()).title}`);
  });

  app.listen(port, () => {
    console.log(`Started on port ${port}`);
  });
})().catch(() => console.log('Error')));
