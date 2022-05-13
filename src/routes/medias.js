import express from 'express';
import { ObjectId } from 'mongodb';
import { mediaColl } from '../db/conn.js';
import {
  idFilter,
  textScoreProj,
  textScoreSort,
  textSearch,
} from '../db/bson.js';
import { downloadAuth, downloadLink } from '../backblaze.js';

const mediaRouter = express.Router();
export default mediaRouter;

mediaRouter.use(express.json());

/**
 * @openapi
 *
 * /medias:
 *   post:
 *     summary: "Create a new media"
 *     operationId: medias.post
 *     requestBody:
 *       $ref: "#/components/requestBodies/media"
 *     responses:
 *       "200":
 *         description: "On success, return the inserted media id"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/id'
 *       default:
 *         $ref: "#/components/responses/default"
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
 *       - $ref: "#/components/parameters/count"
 *     responses:
 *       "200":
 *         description: "Search results"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/media"
 *       default:
 *         $ref: "#/components/responses/default"
 */
mediaRouter.get('/search', async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    res.status(400);
    next(new Error('Expected query field \'query\''));
    return;
  }

  const limit = req.query.count ? parseInt(req.query.count, 10) : 10;
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
 *     operationId: medias.getMany
 *     parameters:
 *       - $ref: "#/components/parameters/mediaType"
 *       - $ref: "#/components/parameters/count"
 *     responses:
 *       "200":
 *         description: "Media list"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/media"
 *       default:
 *         $ref: "#/components/responses/default"
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
 *       - $ref: "#/components/parameters/pathObjectId"
 *     responses:
 *       "200":
 *         description: "Media"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/media"
 *       "400":
 *         description: "Invalid id"
 *       default:
 *         $ref: "#/components/responses/default"
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
 * /medias/{id}/play:
 *   get:
 *     summary: "Retrieve a media play info"
 *     operationId: medias.play
 *     parameters:
 *       - $ref: "#/components/parameters/pathObjectId"
 *     responses:
 *       "200":
 *         description: "Media play info"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 src:
 *                   $ref: '#/components/schemas/url'
 *                 token:
 *                   type: string
 *       "400":
 *         description: "Invalid id"
 *       default:
 *         $ref: "#/components/responses/default"
 */
mediaRouter.get('/:id/play', async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400);
    next(new Error('Invalid id'));
    return;
  }
  /*
  try {
    const result = await mediaColl.findOne(idFilter(req.params.id));
    res.json(result);
  } catch (e) {
    next(e);
  } */
  res.json({ src: `${downloadLink()}/media/bbb/bbb.mp4`, token: await downloadAuth('media/bbb') });
});

/**
 * @openapi
 *
 * /medias/{id}:
 *   put:
 *     summary: "Update a media"
 *     operationId: medias.update
 *     parameters:
 *       - $ref: "#/components/parameters/pathObjectId"
 *     responses:
 *       "200":
 *         description: "Media updated"
 *       "400":
 *         description: "Invalid id"
 *       default:
 *         $ref: "#/components/responses/default"
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
 *     operationId: medias.delete
 *     parameters:
 *       - $ref: "#/components/parameters/pathObjectId"
 *     response:
 *       "200":
 *         description: "Media deleted"
 *       "400":
 *         description: "Invalid id"
 *       default:
 *         $ref: "#/components/responses/default"
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
