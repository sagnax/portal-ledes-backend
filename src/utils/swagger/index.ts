// Swagger type and initial data
const swaggerConfig = {
  path: '/swagger',
  documentation: {
    info: {
      title: 'API Ledes',
      description: 'API destinada ao portal do Ledes',
      version: '1.0.0',
      contact: {
        name: 'Ledes FACOM UFMS',
        email: 'test@gmail.com',
        url: 'https://facom.ufms.br'
      },
    },
    tags: [
      {
        name: 'Home',
        description: 'Entrada da API'
      },
      {
        name: 'Auth',
        description: 'Endpoints de autenticação'
      },
      {
        name: 'Users',
        description: 'Endpoints de usuários'
      },
      {
        name: 'Projeto',
        description: 'Endpoints de projetos'
      },
      {
        name: 'Tipo Projetos',
        description: 'Endpoints de tipos projetos'
      },
      {
        name: 'Tipo Situações Projetos',
        description: 'Endpoints de tipos situações projetos'
      },
      {
        name: 'Tipo Vínculos',
        description: 'Endpoints de tipos vínculos'
      },
      {
        name: 'Tipo Papéis',
        description: 'Endpoints de tipos papéis'
      }
    ]
  }
}

export { swaggerConfig };

/**
 * Exemplo de detalhes de uma rota
 * Documentação do Swagger
 * detail: { 
      tags: ['Home'],
      summary: 'Entrada da API',
      description: 'Retorna a mensagem de entrada da API.',
      security: [{ cookieAuth: [] }],
      parameters: [ 
        { 
          name: 'Authorization',
          in: 'cookie',
          description: 'Token de autenticação',
          required: true,
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { 
                  type: 'string', 
                  example: 'test@gmail.com' 
                },
                password: { 
                  type: 'string', 
                  example: '123456' 
                },
              },
            },
          },
        },
      },
      responses: {
        200: { 
          description: 'OK', 
          headers: { 
            'set-cookie': { 
              schema: { 
                type: 'string', 
                example: 'authToken=abcde12345; secure; httpOnly;' 
              } 
            } 
          },
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'number' },
                  message: { type: 'string' },
                  data: { type: 'string' },
                }
              }
            }
          } 
        }
      }
    } 
 */