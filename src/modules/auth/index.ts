import { Elysia, t } from 'elysia';
import { prisma } from '~libs/prisma';
import { verificaSenha } from '~utils/hash'
import { authMiddleware, verificaAuthUser } from '~middlewares/auth';
import { APIResponseError } from '~utils/erros';

/**
 * Controller de autenticação
 */
export const authController = new Elysia({ prefix: '/auth' })

  .use(authMiddleware)

  .post('/login', async ({ body: { email, password }, set, jwt, setCookie }) : Promise<APIResponse | APIResponseError> => {
    const usuario = await prisma.usuarios.findUnique({ where: { email } });
    // se não existir o usuário
    if (!usuario) {
      return new APIResponseError ({
        status: 401,
        message: 'Usuário e/ou senha incorretos.',
        data: null
      });
    }

    // se encontrar, verifica a senha
    const senhaCorreta = await verificaSenha(password, usuario.senha);
    if (!senhaCorreta) {
      return new APIResponseError ({
        status: 401,
        message: 'Usuário e/ou senha incorretos.',
        data: null
      });
    }
    // se a senha estiver correta, cria o token
    const token = await jwt.sign({ id: usuario.id.toString() });
    // seta o token no cookie
    setCookie('authToken', token, { maxAge: 60 * 10 });
    
    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();
    
    // retorna o token
    set.status = 200;
    return {
      status: 200,
      message: 'Login realizado com sucesso.',
      data: {
        token,
        id: usuario.id,
        nome: usuario.nome,
        sobrenome: usuario.sobrenome,
        email: usuario.email,
        permissaoAdmin: usuario.permissaoAdmin,
        permissaoProjetos: usuario.permissaoProjetos,
        permissaoPublicacoes: usuario.permissaoPublicacoes,
        permissaoUsuarios: usuario.permissaoUsuarios,
      }
    }
  },
    {
      body: t.Object({
        email: t.String(),
        password: t.String()
      }),
      detail: { 
        tags: ['Auth'],
        summary: 'Login de Usuário',
        description: 'Loga o usuário na API, retornando o token de autenticação, setando o token no cookie e retornando os dados do usuário.',
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
            description: 'OK.', 
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
                    status: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Login realizado com sucesso.' },
                    data: { type: 'object' },
                  }
                }
              }
            } 
          },
          401: { 
            description: 'Unauthorized.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 401 },
                    message: { type: 'string', example: 'Usuário e/ou senha incorretos.' },
                    data: { type: 'object' },
                  }
                }
              }
            } 
          }
        }
      }
    }
  )
    
  .get('/logout', async ({ set, setCookie }) : Promise<APIResponse> => {
    // limpa o token do cookie
    setCookie('authToken', '');

    set.status = 200;
    return {
      status: 200,
      message: 'Logout realizado com sucesso.',
      data: null
    }
  },
    {
      beforeHandle: verificaAuthUser,
      detail: { 
        tags: ['Auth'],
        summary: 'Logout de Usuário',
        description: 'Desloga o usuário da API.',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { 
            description: 'OK.', 
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Logout realizado com sucesso.' },
                    data: { type: 'object', example: null },
                  }
                }
              }
            } 
          },
          401: { 
            description: 'Unauthorized.', 
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 401 },
                    message: { type: 'string', example: 'Não Autorizado.' },
                    data: { type: 'object', example: null },
                  }
                }
              }
            } 
          }
        }
      } 
    }
  )