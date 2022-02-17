import express from 'express';
import { initializeDBConn } from './lib/db/conn.js';
import itemsRouter from './lib/items.js';

const app = express();

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
