import express from 'express';
import { ObjectId } from 'mongodb';
import { mediaColl } from '../db/conn.js';
import { idFilter } from '../db/bson.js';
import { downloadAuth, downloadLink } from '../services/backblaze.js';
import { requireAuth } from '../services/auth.js';
import {
  createMedia, findAny, findById, searchMedias,
} from '../services/medias.js';

const mediaRouter = express.Router();
export default mediaRouter;

mediaRouter.use(requireAuth);
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
 *     security:
 *       - token: []
 */
mediaRouter.post('/', async (req, res) => {
  const result = await createMedia(req.body);
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
 *     security:
 *       - token: []
 */
mediaRouter.get('/search', async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    next({ code: 400, error: 'Expected query field \'query\'' });
    return;
  }

  const limit = req.query.count ? parseInt(req.query.count, 10) : 10;
  res.json(await searchMedias(query, limit));
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
 *     security:
 *       - token: []
 */
mediaRouter.get('/', async (req, res) => {
  const count = req.query.count ? parseInt(req.query.count, 10) : 16;
  const type = req.query.type || 'movie';

  res.json(await findAny(type, count));
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
 *     security:
 *       - token: []
 */
mediaRouter.get('/:id', async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    next({ code: 400, error: 'Invalid id' });
    return;
  }
  try {
    const result = await findById(req.params.id);
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
 *     security:
 *       - token: []
 */
mediaRouter.get('/:id/play', async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    next({ code: 400, error: 'Invalid id' });
    return;
  }
  /*
  try {
    const result = await mediaColl.findOne(idFilter(req.params.id));
    res.json(result);
  } catch (e) {
    next(e);
  } */
  res.json({ src: `${downloadLink('medias/bbb/bbb.mp4')}?Authorization=${await downloadAuth('medias/bbb')}` });
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
 *     security:
 *       - token: []
 */
mediaRouter.put('/:id', async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    next({ code: 400, error: 'Invalid id' });
    return;
  }

  const result = await mediaColl.updateOne(idFilter(req.params.id), req.body);
  if (result.modifiedCount === 1) {
    res.send('OK');
  } else {
    next({ code: 400, error: `Media with id '${req.params.id}' doesn't exist` });
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
 *     security:
 *       - token: []
 */
mediaRouter.delete('/:id', async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    next({ code: 400, error: 'Invalid id' });
    return;
  }

  const result = await mediaColl.deleteOne(idFilter(req.params.id));
  if (result.deletedCount === 1) {
    res.send('OK');
  } else {
    next({ code: 400, error: `Media with id '${req.params.id}' doesn't exist` });
  }
});
