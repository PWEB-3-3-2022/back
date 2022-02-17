import express from 'express';
import { itemsColl } from './db/conn.js';
import { idFilter } from './db/filters.js';

const itemsRouter = express.Router();

itemsRouter.use(express.json());

export default itemsRouter;

// POST /
// Create an item
itemsRouter.post('/', async (req, res, next) => {
  const result = await itemsColl.insertOne(req.body);
  res.send(`${result.insertedId}`);
  next();
});

// GET /
// Returns a list of items
itemsRouter.get('/', async (req, res, next) => {
  const count = req.query.count || 16;
  res.json(await itemsColl.find({}).limit(count).toArray());
  next();
});

// GET /[id]
// Return a specific item
itemsRouter.get('/:id', async (req, res, next) => {
  res.json(await itemsColl.findOne(idFilter(req.params.id)));
  next();
});

// PUT /[id]
// Update an item
itemsRouter.put('/:id', async (req, res, next) => {
  const result = await itemsColl.updateOne(idFilter(req.params.id), req.body);
  if (result.modifiedCount === 1) {
    res.send('OK');
  } else {
    res.send('Error');
  }
  next();
});

// DELETE /[id]
// Delete an item
itemsRouter.delete('/:id', async (req, res, next) => {
  const result = await itemsColl.deleteOne(idFilter(req.params.id));
  if (result.deletedCount === 1) {
    res.send('OK');
  } else {
    res.send('Error');
  }
  next();
});
