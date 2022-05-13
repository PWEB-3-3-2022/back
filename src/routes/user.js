import express from 'express';
import { userColl } from '../db/conn.js';
import { idFilter } from '../db/bson.js';
import { checkAuthToken } from '../auth.js';

const userRouter = express.Router();
export default userRouter;

userRouter.use(express.json());

const userCache = [];

/**
 * @openapi
 *
 * /me:
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
 *               $ref: "#/components/schemas/user"
 *       default:
 *         $ref: "#/components/responses/default"
 */
userRouter.post('/', async (req, res) => {
  const parseCookie = (str) => str
    .split(';')
    .map((v) => v.split('='))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
  const cookieHeader = req.header('Cookie');
  if (!(typeof (cookieHeader) === 'string')) {
    res.send({ error: 'No Cookies' });
    return;
  }
  const cookies = parseCookie(cookieHeader);
  if (!cookies.hasOwnProperty('authToken')) {
    res.send({ error: 'No authToken' });
    return;
  }
  const token = checkAuthToken(cookies.authToken);
  if ('error' in token) {
    res.send({ error: token.error });
    return;
  }
  if (token.id in userCache) {
    const user = userCache[token.id];
    res.send(user);
  } else {
    const result = await userColl.findOne(
      idFilter(token.id),
      { projection: { password: 0 } },
    );
    if (result == null) {
      res.send({ error: 'NoAccountError' });
      return;
    }
    userCache[token.id] = result;
    res.send(result);
  }
});
