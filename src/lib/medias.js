import express from 'express';
import { mediaColl } from './db/conn.js';
import {
  idFilter,
  textScoreProj,
  textScoreSort,
  textSearch,
} from './db/filters.js';

const mediaRouter = express.Router();

mediaRouter.use(express.json());

export default mediaRouter;

// POST /
// Create a new media
mediaRouter.post('/', async (req, res, next) => {
  const result = await mediaColl.insertOne(req.body);
  res.send(`${result.insertedId}`);
  next('router');
});

// GET /search
// Search for a media
mediaRouter.get('/search', async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    res.status(400);
    next(new Error('Expected query field \'query\''));
    return;
  }

  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const result = await mediaColl.find(
    textSearch(query, 'fr'),
    { projection: textScoreProj, sort: textScoreSort, limit },
  ).toArray();
  res.json(result);
  next('router');
});

// GET /
// Returns a list of medias
mediaRouter.get('/', async (req, res, next) => {
  const count = req.query.count ? parseInt(req.query.count, 10) : 16;
  const type = req.query.type || 'movie';

  const result = await mediaColl.find({ type }, { limit: count }).toArray();
  // console.log(result);
  res.json(result);
  next('router');
});

// GET /[id]
// Return a specific media
mediaRouter.get('/:id', async (req, res, next) => {
  const result = await mediaColl.findOne(idFilter(req.params.id));
  res.json(result);
  next('router');
});

// PUT /[id]
// Update a media
mediaRouter.put('/:id', async (req, res, next) => {
  const result = await mediaColl.updateOne(idFilter(req.params.id), req.body);
  if (result.modifiedCount === 1) {
    res.send('OK');
  } else {
    res.send('Error');
  }
  next('router');
});

// DELETE /[id]
// Delete a media
mediaRouter.delete('/:id', async (req, res, next) => {
  const result = await mediaColl.deleteOne(idFilter(req.params.id));
  if (result.deletedCount === 1) {
    res.send('OK');
  } else {
    res.send('Error');
  }
  next('router');
});
