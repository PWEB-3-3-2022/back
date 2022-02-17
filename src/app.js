import express from 'express';
import morgan from 'morgan';
import { initializeDBConn } from './lib/db/conn.js';
import itemsRouter from './lib/items.js';

const app = express();

if (process.env.NODE_ENV !== 'production') app.use(morgan('combined'));

app.get('/', async (req, res) => {
  res.send('Hello !');
});

// Register items endpoint
app.use('/items', itemsRouter);

// Connect to database and start web server on success
initializeDBConn().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Started on port ${port}`);
  });
}).catch((err) => console.log(`Error: ${err}`));