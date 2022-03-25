import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export default function createSwaggerRoutes(app) {
  swaggerJsdoc(
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
        './src/swagger/defs.yml',
        './src/lib/auth.js',
        './src/lib/home.js',
        './src/lib/medias.js',
        './src/lib/user.js'],
    },
  ).then((spec) => {
    app.use('/', swaggerUi.serve, swaggerUi.setup(
      spec,
      {
        customSiteTitle: 'TCflix - Swagger UI',
        customfavIcon: 'https://raw.githubusercontent.com/PWEB-3-3-2022/front/master/public/icons/favicon.ico',
        customCss: '.topbar img { content: url("https://pweb-3-3-2022.github.io/front/assets/tcflix_logo.a4acd197.png"); } #operations-tag-default { display: none; }',
      },
    ));
  });
}
