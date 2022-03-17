import express from 'express';
import { mediaColl } from './db/conn.js';

const homeRouter = express.Router();

homeRouter.use(express.json());

export default homeRouter;

/**
 * @openapi
 *
 * /home/movies:
 *   get:
 *     summary: "Retrieve `count` movies"
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: count
 *         in: query
 *         type: integer
 */
homeRouter.get('/movies', async (req, res) => {
  const count = req.query.count ? parseInt(req.query.count, 10) : 4;
  const result = await mediaColl.aggregate([
    { $match: { type: 'movie' } },
    { $sample: { size: count } },
  ]).toArray();
  res.json(result);
});

/**
 * @openapi
 *
 * /home/tvshows:
 *   get:
 *     summary: "Retrieve `count` tv shows"
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: count
 *         in: query
 *         type: integer
 */
homeRouter.get('/tvshows', async (req, res) => {
  const count = req.query.count ? parseInt(req.query.count, 10) : 4;
  const result = await mediaColl.aggregate([
    { $match: { type: 'tvshow' } },
    { $sample: { size: count } },
  ]).toArray();
  res.json(result);
});
