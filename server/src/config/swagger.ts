import swaggerJsdoc from 'swagger-jsdoc'
import path from 'path';

const options = {
   definition: {
      openapi: '3.0.0',
      info: {
         title: 'API control cliente',
         version: '1.0.0',
         description: 'API para manejar el control de ventas de un autolavado',
      },
      servers: [
         {
            url: 'http://localhost:5000',
            description: 'Local Server',
         },
      ],
      components: {
         securitySchemes: {
            bearerAuth: {
               type: 'http',
               scheme: 'bearer',
               bearerFormat: 'JWT',
            },
         },
      },
      security: [
         {
            bearerAuth: [],
         },
      ],
   },

   apis: [path.resolve(__dirname, '../doc/*.yml')],
};

const specs = swaggerJsdoc(options);

export default specs;