import express from 'express';
import { ObjectId } from 'mongodb';
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

/**
 * @openapi
 *
 * /medias:
 *   post:
 *     summary: "Create a new media"
 *     produces:
 *       - application/json
 */
mediaRouter.post('/', async (req, res) => {
  const result = await mediaColl.insertOne(req.body);
  res.send(`${result.insertedId}`);
});

/**
 * @openapi
 *
 * /medias/search:
 *   get:
 *     summary: "Search for medias"
 *     operationId: medias.search
 *     parameters:
 *       - name: query
 *         in: query
 *         description: "Search query"
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: "Search results"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
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
});

/**
 * @openapi
 *
 * /medias:
 *   get:
 *     summary: "Retrieve medias"
 *     parameters:
 *       - name: type
 *         in: query
 *         type: string
 *       - name: count
 *         in: query
 *         type: integer
 *     responses:
 *       "200":
 *         description: "Media list"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
mediaRouter.get('/', async (req, res) => {
  const count = req.query.count ? parseInt(req.query.count, 10) : 16;
  const type = req.query.type || 'movie';

  const result = await mediaColl.find({ type }, { limit: count }).toArray();
  res.json(result);
});

/**
 * @openapi
 *
 * /medias/{id}:
 *   get:
 *     summary: "Retrieve a media"
 *     operationId: medias.getOne
 *     parameters:
 *       - name: id
 *         in: path
 *         description: "Media id"
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: "Media"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       "400":
 *         description: "Invalid id"
 *       default:
 *         description: "Server error"
 */
mediaRouter.get('/:id', async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400);
    next(new Error('Invalid id'));
    return;
  }
  try {
    const result = await mediaColl.findOne(idFilter(req.params.id));
    res.json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 *
 * /medias/{id}:
 *   put:
 *     summary: "Update a media"
 *     operationId: medias.update
 *     parameters:
 *       - name: id
 *         in: path
 *         description: "Media id"
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: "Media updated"
 *       "400":
 *         description: "Invalid id"
 *       default:
 *         description: "Server error"
 */
mediaRouter.put('/:id', async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400);
    next(new Error('Invalid id'));
    return;
  }

  const result = await mediaColl.updateOne(idFilter(req.params.id), req.body);
  if (result.modifiedCount === 1) {
    res.send('OK');
  } else {
    res.status(400);
    next(new Error(`Media with id '${req.params.id}' doesn't exist`));
  }
});

/**
 * @openapi
 *
 * /medias/{id}:
 *   delete:
 *     summary: "Delete a media"
 *     parameters:
 *       - name: id
 *         description: "Media id"
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     response:
 *       "200":
 *         description: "Media deleted"
 *       "400":
 *         description: "Invalid id"
 *       default:
 *         description: "Server error"
 */
mediaRouter.delete('/:id', async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400);
    next(new Error('Invalid id'));
    return;
  }

  const result = await mediaColl.deleteOne(idFilter(req.params.id));
  if (result.deletedCount === 1) {
    res.send('OK');
  } else {
    res.status(400);
    next(new Error(`Media with id '${req.params.id}' doesn't exist`));
  }
});
