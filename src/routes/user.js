import express from 'express';
import { userColl } from '../db/conn.js';
import { idFilter } from '../db/bson.js';
import { requireAuth } from '../auth.js';
import { validateURL, validateEmail } from '../utils.js';

const userRouter = express.Router();
export default userRouter;

userRouter.use(requireAuth);
userRouter.use(express.json());

const userCache = [];

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
  if (req.auth.id in userCache) {
    const user = userCache[req.auth.id];
    res.send(user);
  } else {
    const result = await userColl.findOne(
        idFilter(req.auth.id),
        { projection: { password: 0 } },
    );
    if (result == null) {
      next({ code: 400, error: 'NoAccountError' });
      return;
    }
    userCache[req.auth.id] = result;
    res.send(result);
  }
});

/**
 * @openapi
 *
 * /me/changeProfileEmail:
 *   post:
 *     summary: "Change profile email"
 *     operationId: user.profile.edit.email
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileId:
 *                  type: int
 *               newEmail:
 *                  type: string
 *             required:
 *               - authToken
 *               - profileId
 *               - newEmail
 *     responses:
 *       "200":
 *         description: "Success"
 *       default:
 *         $ref: "#/components/responses/default"
 *     security:
 *       - token: []
 */
userRouter.post('/changeProfileEmail', async (req, res) => {
  const { profileId, newEmail } = req.body;
  if (Number.isNaN(parseInt(profileId, 10)) || userCache[req.auth.id].profiles[profileId] === null) {
    res.send({ error: 'InvalidProfileIdError' });
    return;
  }
  if (newEmail !== '' && !validateEmail(newEmail)) {
    res.send({ error: 'InvalidEmailError' });
    return;
  }
  userCache[req.auth.id].profiles[profileId].email = newEmail;
  const query = idFilter(req.auth.id);
  const setValue = {};
  setValue[`profiles.${profileId}.1`] = newEmail;
  const updateDocument = {
    $set: setValue,
  };
  await userColl.updateOne(query, updateDocument);
  res.send({ response: 'OK' });
});

/**
 * @openapi
 *
 * /me/deleteUserProfile:
 *   post:
 *     summary: "Delete user profile"
 *     operationId: user.profile.delete
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileId:
 *                  type: int
 *             required:
 *               - authToken
 *               - profileId
 *     responses:
 *       "200":
 *         description: "The profile has been deleted."
 *       default:
 *         $ref: "#/components/responses/default"
 *     security:
 *       - token: []
 */
userRouter.post('/deleteUserProfile', async (req, res) => {
  const { profileId } = req.body;
  if (Number.isNaN(parseInt(profileId, 10)) || userCache[req.auth.id].profiles[profileId] === null || profileId == 0) {
    res.send({ error: 'InvalidProfileIdError' });
    return;
  }
  delete userCache[req.auth.id].profiles[profileId];
  const query = idFilter(req.auth.id);
  const unsetValue = {};
  unsetValue[`profiles.${profileId}`] = 1;
  const updateDocument = {
    $unset: unsetValue,
  };
  await userColl.updateOne(query, updateDocument);
  res.send({ response: 'OK' });
});

/**
 * @openapi
 *
 * /me/createUserProfile:
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
 *               picture:
 *                  type: string
 *             required:
 *               - authToken
 *               - name
 *               - picture
 *     responses:
 *       "200":
 *         description: "The profile has been created."
 *       default:
 *         $ref: "#/components/responses/default"
 *     security:
 *       - token: []
 */
userRouter.post('/createUserProfile', async (req, res) => {
  const { profileName, profilePicture } = req.body;
  if (profileName === '') {
    res.send({ error: 'InvalidNameError' });
    return;
  }
  if (!validateURL(profilePicture)) {
    res.send({ error: 'InvalidUrlError' });
    return;
  }
  const newProfileId = userCache[req.auth.id].profiles.length;
  userCache[req.auth.id].profiles[newProfileId] = {};
  userCache[req.auth.id].profiles[newProfileId].name = '';
  userCache[req.auth.id].profiles[newProfileId].email = '';
  userCache[req.auth.id].profiles[newProfileId].picture = profilePicture;

  const query = idFilter(req.auth.id);
  let setValue = {};
  setValue[`profiles.${newProfileId}`] = [];
  let updateDocument = {
    $set: setValue,
  };
  await userColl.updateOne(query, updateDocument);
  setValue = {};
  setValue[`profiles.${newProfileId}.0`] = profileName;
  updateDocument = {
    $set: setValue,
  };
  await userColl.updateOne(query, updateDocument);
  setValue = {};
  setValue[`profiles.${newProfileId}.1`] = '';
  updateDocument = {
    $set: setValue,
  };
  await userColl.updateOne(query, updateDocument);
  setValue = {};
  setValue[`profiles.${newProfileId}.2`] = profilePicture;
  updateDocument = {
    $set: setValue,
  };
  await userColl.updateOne(query, updateDocument);
  res.send({ response: newProfileId });
});
