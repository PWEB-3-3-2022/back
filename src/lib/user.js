import express from 'express';
import CryptoJS from 'crypto-js';
import { checkAuthToken } from './auth.js';
import { userColl, toObjectId } from './db/conn.js';

const userRouter = express.Router();
const tokenPass = `${process.env.TOKEN_KEY}`;

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
  const decryptedToken = CryptoJS.AES.decrypt(`${authToken}`, tokenPass).toString(CryptoJS.enc.Utf8);
  const token = checkAuthToken(`${decryptedToken}`);
  if (Object.prototype.hasOwnProperty.call(token, 'error')) {
    res.send({ error: token.error });
    return;
  }
  if (token.id in userCache) {
    const user = userCache[token.id];
    res.send({
      name: user.name, email: user.email, role: user.role,
    });
  } else {
    const result = await userColl.findOne({ _id: toObjectId(token.id) });
    if (result == null) {
      res.send({ error: 'NoAccountError' });
      return;
    }
    userCache[token.id] = {
      name: result.name, email: result.email, role: result.role,
    };
    res.send(JSON.stringify(userCache[token.id]));
  }
  // Check le tableau des users, s'il n'y est pas dedans, on query la DB
});

userRouter.options('/', (req, res) => {
  res.sendStatus(200);
});
