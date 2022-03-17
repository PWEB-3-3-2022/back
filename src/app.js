import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { initializeDBConn } from './lib/db/conn.js';
import mediaRouter from './lib/medias.js';
import homeRouter from './lib/home.js';

const app = express();

// CORS middleware
app.use(cors());

// Call logger
if (process.env.NODE_ENV !== 'production') app.use(morgan('combined'));

app.get('/', async (req, res) => {
  res.send('Hello !');
});

// Register homepage endpoint
app.use('/home', homeRouter);

// Register medias endpoints
app.use('/medias', mediaRouter);

// Connect to database and start web server on success
initializeDBConn().then(() => {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Started on port ${port}`);
  });
}).catch((err) => console.log(`Error: ${err}`));
