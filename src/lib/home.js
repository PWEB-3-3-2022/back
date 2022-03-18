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
 *     summary: "Retrieve a random movie list"
 *     operationId: home.movies.random
 *     parameters:
 *       - $ref: "#/components/parameters/count"
 *     responses:
 *       "200":
 *         description: "Random movie list"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/movie"
 *       default:
 *         $ref: "#/components/responses/default"
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
 *     summary: "Retrieve a random tv show list"
 *     operationId: home.tvshows.random
 *     parameters:
 *       - $ref: "#/components/parameters/count"
 *     responses:
 *       "200":
 *         description: "Random tv show list"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/tvshow"
 *       default:
 *         $ref: "#/components/responses/default"
 */
homeRouter.get('/tvshows', async (req, res) => {
  const count = req.query.count ? parseInt(req.query.count, 10) : 4;
  const result = await mediaColl.aggregate([
    { $match: { type: 'tvshow' } },
    { $sample: { size: count } },
  ]).toArray();
  res.json(result);
});
