import express from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth } from '../services/auth.js';
import { validateEmail, validateURL } from '../utils.js';
import * as user from '../services/user.js';

const userRouter = express.Router();
export default userRouter;

userRouter.use(requireAuth);
userRouter.use(express.json());

/**
 * @openapi
 *
 * /me:
 *   get:
 *     summary: "Retrieve user account infos"
 *     operationId: user.infos
 *     responses:
 *       "200":
 *         description: "On success, return all infos about the account"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/user"
 *       default:
 *         $ref: "#/components/responses/default"
 *     security:
 *       - token: []
 */
userRouter.get('/', async (req, res, next) => {
  const result = await user.findById(req.auth.id);
  if (result == null) {
    next({ code: 403, error: 'AccountNotFound' });
    return;
  }
  res.send(result);
});

/**
 * @openapi
 *
 * /me/profiles:
 *   post:
 *     summary: "Create user profile"
 *     operationId: user.profile.create
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                  type: string
 *               email:
 *                  type: string
 *               picture:
 *                  type: string
 *             required:
 *               - name
 *     responses:
 *       "200":
 *         description: "The profile has been created."
 *       default:
 *         $ref: "#/components/responses/default"
 *     security:
 *       - token: []
 */
userRouter.post('/profiles', async (req, res, next) => {
  const { name, email, picture } = req.body;
  if (name === undefined || name === '') {
    res.send({ error: 'InvalidNameError' });
    return;
  }
  if (email && !validateEmail(email)) {
    res.send({ error: 'InvalidEmailError' });
    return;
  }
  if (picture && !validateURL(picture)) {
    res.send({ error: 'InvalidUrlError' });
    return;
  }
  const profile = { name, email, picture };
  res.send({ response: await user.createProfile(req.auth.id, profile) });
});

/**
 * @openapi
 *
 * /me/profiles/{id}:
 *   put:
 *     summary: "Update profile"
 *     operationId: user.profile.update
 *     parameters:
 *       - $ref: "#/components/parameters/pathObjectId"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                  type: string
 *               picture:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       "200":
 *         description: "Success"
 *       default:
 *         $ref: "#/components/responses/default"
 *     security:
 *       - token: []
 */
userRouter.put('/profiles/:id', async (req, res, next) => {
  const profileId = req.params.id;
  // Profile id is either 0 or an ObjectId
  if ((profileId !== '0' && !ObjectId.isValid(profileId)) || profileId === '0') {
    next({ code: 400, error: 'InvalidProfileIdError' });
    return;
  }
  const { email } = req.body;
  let { name, picture } = req.body;
  if (name === null && email === null && picture === null) {
    next({ code: 400, error: 'InvalidUpdateError' });
    return;
  }
  const usr = await user.findById(req.auth.id);
  if (!name) {
    /* res.send({ error: 'InvalidNameError' });
    return; */
    name = usr.profiles[profileId].name;
  }
  if (email === null || (email && !validateEmail(email))) {
    res.send({ error: 'InvalidEmailError' });
    return;
  }
  if (picture && !validateURL(picture)) {
    res.send({ error: 'InvalidPictureError' });
    return;
  }
  if (!picture) {
    picture = usr.profiles[profileId].picture;
  }
  const result = await user.updateProfile(req.auth.id, profileId, { name, email, picture });
  if ('error' in result) {
    next({ code: 500, error: result.error });
    return;
  }
  res.send({ response: 'OK' });
});

/**
 * @openapi
 *
 * /me/profiles/{id}:
 *   delete:
 *     summary: "Delete user profile"
 *     operationId: user.profile.delete
 *     parameters:
 *       - $ref: "#/components/parameters/pathObjectId"
 *     responses:
 *       "200":
 *         description: "The profile has been deleted."
 *       default:
 *         $ref: "#/components/responses/default"
 *     security:
 *       - token: []
 */
userRouter.delete('/profiles/:id', async (req, res, next) => {
  const profileId = req.params.id;
  // Profile id is either 0 or an ObjectId
  if ((profileId !== '0' && !ObjectId.isValid(profileId)) || profileId === '0') {
    next({ code: 400, error: 'InvalidProfileIdError' });
    return;
  }
  await user.deleteProfile(req.auth.id, profileId);
  res.send({ response: 'OK' });
});
