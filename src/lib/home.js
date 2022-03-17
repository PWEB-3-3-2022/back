import express from 'express';
import { mediaColl } from './db/conn.js';

const homeRouter = express.Router();

homeRouter.use(express.json());

export default homeRouter;

// GET /movies
// Return random movies
homeRouter.get('/movies', async (req, res, next) => {
  const count = req.query.count ? parseInt(req.query.count, 10) : 4;
  const result = await mediaColl.aggregate([
    { $match: { type: 'movie' } },
    { $sample: { size: count } },
  ]).toArray();
  res.json(result);
  next('router');
});

// GET /tvshows
// Return random tv shows
homeRouter.get('/tvshows', async (req, res, next) => {
  const count = req.query.count ? parseInt(req.query.count, 10) : 4;
  const result = await mediaColl.aggregate([
    { $match: { type: 'tvshow' } },
    { $sample: { size: count } },
  ]).toArray();
  res.json(result);
  next('router');
});
