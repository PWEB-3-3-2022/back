import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { initializeDBConn } from './lib/db/conn.js';
import mediaRouter from './lib/medias.js';
import homeRouter from './lib/home.js';

const openapi = swaggerJsdoc(
  {
    failOnErrors: false,
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'TCflix',
        version: '0.1.0',
      },
    },
    apis: [
      './src/components.yml',
      './src/lib/home.js',
      './src/lib/medias.js'],
  },
);

const app = express();

// CORS middleware
app.use(cors());

// Call logger
if (process.env.NODE_ENV !== 'production') app.use(morgan('combined'));

// Swagger UI
openapi.then((spec) => {
  app.use('/', swaggerUi.serve, swaggerUi.setup(
    spec,
    { customCss: '.topbar img { content: url("https://pweb-3-3-2022.github.io/front/assets/tcflix_logo.a4acd197.png"); }' },
  ));
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
