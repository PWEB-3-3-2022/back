import express from 'express';
import argon2 from 'argon2';
import CryptoJS from 'crypto-js';
import { userColl } from './db/conn.js';

const authRouter = express.Router();
const tokenPass = `${process.env.TOKEN_KEY}`;

authRouter.use(express.json());

export default authRouter;

function validateEmail(email) {
  return String(email).toLowerCase().match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  );
}

export function checkAuthToken(authToken) {
  let result = {};
  let decryptedToken = '';
  try {
    decryptedToken = CryptoJS.AES.decrypt(`${authToken}`, tokenPass)
      .toString(CryptoJS.enc.Utf8);
  } catch (error) {
    result.error = 'InvalidTokenError';
    return result;
  }
  const split = decryptedToken.split('|');
  if (split.length !== 3) {
    result.error = 'InvalidTokenError';
    return result;
  }

  const valid = (new Date(parseInt(split[2], 10))).getTime() > 0;

  if (!valid) {
    result.error = 'InvalidTokenError';
    return result;
  }

  if (Date.now() > result.expires) {
    result.error = 'ExpiredTokenError';
    return result;
  }

  result = { id: split[0], role: split[1], expires: split[2] };

  return result;
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
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       default:
 *         $ref: "#/components/responses/default"
 */
authRouter.post('/login', async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const hashedPWD = await argon2.hash(password);
  console.log(`User name = ${email}, pswd is ${hashedPWD}`);
  const result = await userColl.findOne({ email });
  if (result == null) {
    res.send({ error: 'NoAccountError' });
    return;
  }
  if (await argon2.verify(result.password, password)) {
    console.log(`Found: ${email}, pass=${hashedPWD}`);
    const date = new Date().getDate();
    const expirationDate = new Date().setDate(rememberMe ? date + 7 : date + 1);
    // eslint-disable-next-line no-underscore-dangle
    const authToken = CryptoJS.AES.encrypt(`${result._id}|${result.role}|${expirationDate}`, tokenPass);
    res.send({
      authToken: `${authToken}`,
      expires: `${new Date(expirationDate).toUTCString()}`,
    });
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
    },
  );
  if (result.insertedId) {
    res.send({ response: 'OK' });
  } else {
    res.status(500);
    next(new Error('Cannot insert new user'));
  }
});
