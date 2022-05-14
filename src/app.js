import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initializeDBConn } from './db/conn.js';
import mediaRouter from './routes/medias.js';
import homeRouter from './routes/home.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import createSwaggerRoutes from './swagger/swagger.js';

const app = express();

// CORS middleware
app.use(cors({
  origin: 'https://pweb-3-3-2022.github.io',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(cookieParser());

// Call logger
if (process.env.NODE_ENV !== 'production') app.use(morgan('combined'));

createSwaggerRoutes(app);

// Register homepage endpoint
app.use('/home', homeRouter);

// Register medias endpoints
app.use('/medias', mediaRouter);

// Register auth endpoints
app.use('/auth', authRouter);

// Register user endpoints
app.use('/me', userRouter);

app.use((err, req, res, next) => {
  //console.log(err);
  if (err.code)
    res.status(err.code)
  else
    res.status(500)
  res.send({ error: err.error });
});

// Connect to database and start web server on success
// Ignore linter here
await initializeDBConn();
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
