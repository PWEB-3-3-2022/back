import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { initializeDBConn } from './lib/db/conn.js';
import mediaRouter from './lib/medias.js';

const app = express();

app.use(cors());

if (process.env.NODE_ENV !== 'production') app.use(morgan('combined'));

app.get('/', async (req, res) => {
  res.send('Hello !');
});

// Register items endpoint
app.use('/medias', mediaRouter);

// Connect to database and start web server on success
initializeDBConn().then(() => {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Started on port ${port}`);
  });
}).catch((err) => console.log(`Error: ${err}`));
