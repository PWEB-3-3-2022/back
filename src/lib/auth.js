import express from 'express';
import CryptoJS from 'crypto-js';
import { userColl } from './db/conn.js';

const authRouter = express.Router();

authRouter.use(express.json());

export default authRouter;

/**
 * @openapi
 *
 * /auth/login:
 *   post:
 *     summary: "Login to use the API"
 *     operationId: login.login
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       "200":
 *         description: "On success, return an auth token"
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       default:
 *         $ref: "#/components/responses/default"
 */
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const sha3PWD = CryptoJS.SHA3(password);
  console.log(`User name = ${email}, pswd is ${sha3PWD}`);
  userColl.findOne({ email, password: `${sha3PWD}` }, (err, result) => {
    if (err) throw err;
    if (result) {
      console.log(`Found: ${email}, pass=${sha3PWD}`);
      res.send({ check: 'noice' });
    } else {
      console.log(`Not found: ${email}`);
      res.send({ check: 'NOPE' });
    }
  });
});

authRouter.options('/login', (req, res) => {
  res.sendStatus(200);
});
