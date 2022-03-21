import express from 'express';
import argon2 from 'argon2';
import CryptoJS from 'crypto-js';
import { userColl } from './db/conn.js';

const authRouter = express.Router();
const tokenPass = `${process.env.TOKEN_KEY}`;

authRouter.use(express.json());

export default authRouter;

const validateEmail = (email) => String(email)
  .toLowerCase()
  .match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  );

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
authRouter.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  const hashedPWD = await argon2.hash(password);
  console.log(`User name = ${email}, pswd is ${hashedPWD}`);
  const result = await userColl.findOne({ email });
  if (result == null) {
    res.send({ error: 'NoAccountError' });
    return;
  }
  if (await argon2.verify(result.password, password)) {
    console.log(`Found: ${email}, pass=${hashedPWD}`);
    const expirationDate = new Date().setDate(new Date().getDate() + 7);
    // eslint-disable-next-line no-underscore-dangle
    const authToken = CryptoJS.AES.encrypt(`${result._id}|${result.email}|${expirationDate}`, tokenPass);
    const updateDocument = {
      $set: {
        authToken: `${authToken}`,
      },
    };
    // eslint-disable-next-line no-underscore-dangle
    if (await userColl.updateOne({ _id: result._id }, updateDocument)) {
      res.send({ authToken: `${authToken}`, expires: `${new Date(expirationDate).toUTCString()}` });
    } else {
      res.status(500);
      next(new Error('Cannot insert new user'));
    }
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
  const digest = await argon2.hash(password);
  if (!validateEmail(email)) {
    res.send({ error: 'IncorrectEmailError' });
    return;
  }
  const search = await userColl.findOne({ email });
  if (search != null) {
    res.send({ error: 'AccountAlreadyExistsError' });
    return;
  }
  const result = await userColl.insertOne({ name, email, password: digest });
  if (result.insertedId) {
    res.send({ response: 'OK' });
  } else {
    res.status(500);
    next(new Error('Cannot insert new user'));
  }
});

authRouter.options('/', (req, res) => {
  res.sendStatus(200);
});
