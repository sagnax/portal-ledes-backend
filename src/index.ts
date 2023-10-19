import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger'
import { swaggerConfig } from '~utils/swagger';
import { authController } from '~modules/auth';
import { usersController } from '~modules/users';


const app = new Elysia({ prefix: '/api' })
  // Log de todas as requisições
  .onRequest((context) => {
    console.log(`${context.request.method} - ${context.request.url}`);
  })
  
  // Tratamento de erros
  .onError((context) => {
    console.log(context.error);

    let message = 'Error';
    if ('status' in context.error) {
      context.set.status = context.error.status;
      message = context.error.message;
    } else {
      context.set.status = 500;
      message = 'Internal Server Error';
    }
    return {
      status: context.set.status,
      message: message,
      data: null,
    }
  })

  // Documentação da Api
  .use(swagger(swaggerConfig))

  // Entrada da Api
  .get('/', () => 'API Ledes', {
    // Documentação Swagger
    detail: { 
      tags: ['Home'],
      summary: 'Entrada da API',
      description: 'Retorna a mensagem de entrada da API.',
      responses: {
        200: { 
          description: 'OK',
          content: {
            'text/plain': {
              schema: {
                type: 'string',
                example: 'API Ledes'
              }
            }
          }
        },
      },
    } 
  })

  // Controladores das rotas
  .use(authController)
  .use(usersController)

  // Inicia o servidor
  .listen(2077);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
