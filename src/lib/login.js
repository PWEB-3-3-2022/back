import express from 'express';
import CryptoJS from 'crypto-js';
import { userColl } from './db/conn.js';

const loginRouter = express.Router();

loginRouter.use(express.json());

export default loginRouter;

loginRouter.post('/', async (req, res) => {
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

loginRouter.options('/', (req, res) => {
  res.sendStatus(200);
});
