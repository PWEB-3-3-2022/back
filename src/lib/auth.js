import express from 'express';
import argon2 from 'argon2';
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
  const hashedPWD = await argon2.hash(password);
  console.log(`User name = ${email}, pswd is ${hashedPWD}`);
  const result = await userColl.findOne({ email });
  if (result == null) {
    res.send({ check: 'NOPE' });
    return;
  }
  if (await argon2.verify(result.password, password)) {
    console.log(`Found: ${email}, pass=${hashedPWD}`);
    res.send({ check: 'noice' });
  } else {
    console.log(`Not found: ${email}`);
    res.send({ check: 'NOPE' });
  }
});

authRouter.options('/', (req, res) => {
  res.sendStatus(200);
});
