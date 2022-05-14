import express from 'express';
import argon2 from 'argon2';
import { userColl } from '../db/conn.js';
import { createAuthToken } from '../auth.js';

const authRouter = express.Router();
export default authRouter;

authRouter.use(express.json());

export function validateEmail(email) {
  return email.toLowerCase().match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  );
}

/**
 * @openapi
 *
 * /auth/login:
 *   post:
 *     summary: "Login to use the API"
 *     operationId: auth.login
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
 *         headers:
 *           Set-Cookie:
 *             description: "Auth token"
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       default:
 *         $ref: "#/components/responses/default"
 */

authRouter.post('/login', async (req, res) => {
  const { email, password, rememberMe } = req.body;
  // const hashedPWD = await argon2.hash(password);
  // console.log(`User name = ${email}, pswd is ${hashedPWD}`);
  const result = await userColl.findOne({ email });
  if (result == null) {
    res.send({ error: 'NoAccountError' });
    return;
  }
  if (await argon2.verify(result.password, password)) {
    // console.log(`Found: ${email}, pass=${hashedPWD}`);
    // eslint-disable-next-line no-underscore-dangle
    const authToken = createAuthToken(result._id, result.role, rememberMe ? 30 : 7);
    const date = new Date().getDate();
    const expirationDate = new Date().setDate(rememberMe ? date + 7 : date + 1);
    res.cookie('authToken', authToken, {
      sameSite: 'none', secure: true, path: '/', httpOnly: true, maxAge: expirationDate,
    });
    res.send({ ok: 'ok' });
  } else {
    console.log(`Not found: ${email}`);
    res.send({ error: 'NoAccountError' });
  }
});

/**
 * @openapi
 *
 * /auth/register:
 *   post:
 *     summary: "Register a new account"
 *     operationId: auth.register
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
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
authRouter.post('/register', async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!validateEmail(email)) {
    res.send({ error: 'IncorrectEmailError' });
    return;
  }
  const search = await userColl.findOne({ email });
  if (search != null) {
    res.send({ error: 'AccountAlreadyExistsError' });
    return;
  }
  const result = await userColl.insertOne(
    {
      name,
      email,
      password: await argon2.hash(password),
      role: 'user',
      created: new Date(),
      profiles: { 0: { name, email, picture: 'https://occ-0-784-778.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABb_DHMVDo8hDAK3yCzp_kViqNAzRqtn4oFSvy8FppaaBvPEgXCYaVMOX7QyrOZvuznXMuC7CCX4H0-NmnBa5bxs4CCEluvvauk87.png?r=a41' } },
    },
  );
  if (result.insertedId) {
    res.send({ response: 'OK' });
  } else {
    res.status(500);
    next(new Error('Cannot insert new user'));
  }
});
