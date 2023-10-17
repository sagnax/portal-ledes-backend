import { Elysia, t } from 'elysia';
import { prisma } from '~libs/prisma';
import { hashSenha, verificaSenha, hashEmail } from '~utils/hash'
import { auth as authMiddleware, verificaAuthUser } from '~middlewares/auth';

/**
 * Controller de autenticação
 */
export const authController = new Elysia({ prefix: '/auth' })

  .use(authMiddleware)

  .post('/login', async ({ body: { email, password }, set, jwt, setCookie }) => {
    const usuario = await prisma.usuarios.findUnique({ where: { email } });
    // se não existir o usuário
    if (!usuario) {
      set.status = 401;
      return {
        status: 401,
        message: 'Usuário e/ou senha incorretos.',
        data: null
      }
    }

    // se encontrar, verifica a senha
    const senhaCorreta = await verificaSenha(password, usuario.senha);
    if (!senhaCorreta) {
      set.status = 401;
      return {
        status: 401,
        message: 'Usuário e/ou senha incorretos.',
        data: null
      }
    }
    // se a senha estiver correta, cria o token
    const token = await jwt.sign({ id: usuario.id.toString() });
    // seta o token no cookie
    setCookie('authToken', token, { httpOnly: true, maxAge: 60 * 10, sameSite: 'lax', secure: true });
    
    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();
    
    // retorna o token
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
      })
    }
  )
    
  .get('/logout', async ({ set, setCookie, jwt, cookie, getAuthUser }) : Promise<APIResponse> => {
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
        summary: 'Logout Usuário',
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
            description: 'Não autorizado.', 
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