import express from 'express';
import { requireAuth } from '../services/auth.js';
import { homepageMovies, homepageTvshows } from '../services/home.js';

const homeRouter = express.Router();
export default homeRouter;

homeRouter.use(requireAuth);
homeRouter.use(express.json());

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
 *     security:
 *       - token: []
 */
homeRouter.get('/movies', async (req, res) => {
  const count = req.query.count ? parseInt(req.query.count, 10) : 4;
  res.json(await homepageMovies(count));
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
 *     security:
 *       - token: []
 */
homeRouter.get('/tvshows', async (req, res) => {
  const count = req.query.count ? parseInt(req.query.count, 10) : 4;
  res.json(await homepageTvshows(count));
});
