import express from 'express';
import { ObjectId } from 'mongodb';
import { checkAuthToken } from './auth.js';
import { userColl } from './db/conn.js';

const userRouter = express.Router();

userRouter.use(express.json());

export default userRouter;

const userCache = [];

/**
 * @openapi
 *
 * /user/infos:
 *   post:
 *     summary: "Retrieve user account infos"
 *     operationId: user.infos
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               authToken:
 *                 type: string
 *             required:
 *               - authToken
 *     responses:
 *       "200":
 *         description: "On success, return all infos about the account"
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       default:
 *         $ref: "#/components/responses/default"
 */
userRouter.post('/infos', async (req, res) => {
  const { authToken } = req.body;
  const token = checkAuthToken(`${authToken}`);
  if (Object.prototype.hasOwnProperty.call(token, 'error')) {
    res.send({ error: token.error });
    return;
  }
  if (token.id in userCache) {
    const user = userCache[token.id];
    res.send({
      name: user.name, email: user.email, role: user.role, created: user.created,
    });
  } else {
    const result = await userColl.findOne({ _id: ObjectId(token.id) });
    if (result == null) {
      res.send({ error: 'NoAccountError' });
      return;
    }
    userCache[token.id] = {
      name: result.name, email: result.email, role: result.role, created: result.created,
    };
    res.send(JSON.stringify(userCache[token.id]));
  }
});
