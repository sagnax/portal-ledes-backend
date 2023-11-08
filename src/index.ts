import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger'
import { swaggerConfig } from '~utils/swagger';
import { APIResponseError } from '~utils/erros';
// Controllers Imports
import { authController } from '~modules/auth';
import { usersController } from '~modules/users';
import { projetosController } from '~modules/projetos';
import { tipoProjetosController } from '~modules/tipo-projetos';
import { tipoSituacoesProjetosController } from '~modules/tipo-situacoes-projetos';
import { tipoVinculosController } from '~modules/tipo-vinculos';
import { tipoPapeisController } from '~modules/tipo-papeis';
// Controllers Configuração
import { configuracaoSobreNosController } from '~modules/configuracao-sobre-nos';


const app = new Elysia({ prefix: '/api' })
  // Log de todas as requisições
  .onRequest(({ request }) => {
    console.log(`${request.method} - ${request.url}`);
  })
  
  // Tratamento de erros
  .onError(({ error, set }) => {
    console.log(error);
    // status, message e data padrão
    let status = 500;
    let message = 'Internal Server Error';
    let data = null;

    // verifica se o erro é um erro da API, se for, pega os dados do erro
    if (error instanceof APIResponseError) {
      status = error.errorData.status;
      message = error.errorData.message;
      data = error.errorData.data;
    }
    // retorna o erro tratado
    set.status = status;
    return {
      status: status,
      message: message,
      data: data,
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
  .use(projetosController)
  .use(tipoSituacoesProjetosController)
  .use(tipoProjetosController)
  .use(tipoVinculosController)
  .use(tipoPapeisController)
  // Configuração
  .use(configuracaoSobreNosController)

  // Inicia o servidor
  .listen(2077);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
