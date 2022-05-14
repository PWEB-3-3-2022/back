import express from 'express';
import { userColl } from '../db/conn.js';
import { idFilter } from '../db/bson.js';
import { checkAuth } from '../auth.js';

const userRouter = express.Router();
export default userRouter;

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
userRouter.get('/', async (req, res) => {
  const auth = checkAuth(req);
  if ('error' in auth) {
    res.send({ error: auth.error });
    return;
  }
  if (auth.id in userCache) {
    const user = userCache[auth.id];
    res.send(user);
  } else {
    const result = await userColl.findOne(
      idFilter(auth.id),
      { projection: { password: 0 } },
    );
    if (result == null) {
      res.send({ error: 'NoAccountError' });
      return;
    }
    userCache[auth.id] = result;
    res.send(result);
  }
});
