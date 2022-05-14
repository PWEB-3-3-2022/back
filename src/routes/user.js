import express from 'express';
import { userColl } from '../db/conn.js';
import { idFilter } from '../db/bson.js';
import { requireAuth, validateEmail } from '../auth.js';

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
 *     operationId: user.changeProfileEmail
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
