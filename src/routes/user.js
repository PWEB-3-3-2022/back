import express from 'express';
import { userColl } from '../db/conn.js';
import { idFilter } from '../db/bson.js';
import { requireAuth } from '../auth.js';

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
