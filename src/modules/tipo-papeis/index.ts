import { Elysia, t } from 'elysia';
import { prisma } from '~libs/prisma';
import { authMiddleware, verificaAuthUser } from '~middlewares/auth';
import { Usuarios } from '@prisma/client';
import { APIResponseError } from '~utils/erros';

/**
 * Controller de Tipo Papéis
 */
export const tipoPapeisController = new Elysia({ prefix: '/tipo-papeis' })

  .use(authMiddleware)

  .post('/add', async ({ body, set, cookie, jwt, getAuthUser, verificaPermissao }) : Promise<APIResponse | APIResponseError> => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
    // verifica se o usuario tem permissão de Admin ou Usuarios
    verificaPermissao(usuario, "ADMINISTRADOR");

    // pega os dados do body
    const { nome } = body;

    // verifica se o tipo papel já existe
    const tipoPapelExiste = await prisma.tipoPapeis.findFirstAtivo({ where: { nome } });
    if (tipoPapelExiste) {
      return new APIResponseError ({
        status: 409,
        message: 'Tipo Papel já existe.',
        data: null
      });
    }

    // verifica se o nome atende aos requisitos mínimos	
    if (nome && nome.length < 3) {
      return new APIResponseError ({
        status: 400,
        message: 'Nome não atende aos requisitos mínimos.',
        data: null
      });
    }

    // cria o novo tipo papel
    const novoTipoPapelCriado = await prisma.tipoPapeis.createWithAuthUser({
      data: {
        nome,
      }
    },
      usuario
    );

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o novo tipo papel
    set.status = 201;
    return {
      status: 201,
      message: 'Tipo Papel criado com sucesso.',
      data: novoTipoPapelCriado
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        nome: t.String(),
      }),
      detail: { 
        tags: ['Tipo Papéis'],
        summary: 'Adicionar Tipo Papel',
        description: 'Adiciona o novo tipo papel ao banco e retorna os dados do tipo papel.',
        security: [{ cookieAuth: [] }],
        responses: {
          201: {
            description: 'Created.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 201 },
                    message: { type: 'string', example: 'Tipo Papel criado com sucesso.' },
                    data: { type: 'object' },
                  }
                }
              }
            }
          },
          400: { 
            description: 'Bad Request.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 400 },
                    message: { type: 'string', example: 'Nome não atende aos requisitos mínimos.' },
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
                    message: { type: 'string', example: 'Não autorizado.' },
                    data: { type: 'object' },
                  }
                }
              }
            } 
          },
          403: { 
            description: 'Forbidden.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 403 },
                    message: { type: 'string', example: 'Usuário sem permissão.' },
                    data: { type: 'object' },
                  }
                }
              }
            } 
          },
          409: { 
            description: 'Conflict.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 409 },
                    message: { type: 'string', example: 'Tipo Papel já existe.' },
                    data: { type: 'object' },
                  }
                }
              }
            } 
          },
        }
      }
    }
  )

  .patch('/edit/:id', async ({ params, body, set, cookie, jwt, getAuthUser, verificaPermissao }) : Promise<APIResponse | APIResponseError> => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
    // verifica se o usuario tem permissão de Admin ou Usuarios
    verificaPermissao(usuario, "ADMINISTRADOR");

    // pega os dados do body
    const { nome } = body;

    // verifica se o id existe
    const tipoPapelParaEditar = await prisma.tipoPapeis.findUniqueAtivo({ where: { id: parseInt(params.id) } });
    if (!tipoPapelParaEditar) {
      return new APIResponseError ({
        status: 404,
        message: 'Tipo Papel não existe.',
        data: null
      });
    }

    const tipoPapelEditado = await prisma.tipoPapeis.updateWithAuthUser({
      data: {
        nome,
      },
      where: {
        id: parseInt(params.id)
      }
    },
      usuario
    );

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o tipo papel editado
    set.status = 200;
    return {
      status: 200,
      message: 'Tipo Papel editado com sucesso.',
      data: tipoPapelEditado
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        nome: t.String(),
      }),
      detail: { 
        tags: ['Tipo Papéis'],
        summary: 'Editar Tipo Papel',
        description: 'Edita e retorna os dados do tipo papel.',
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
                    message: { type: 'string', example: 'Tipo Papel editado com sucesso.' },
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
                    message: { type: 'string', example: 'Não autorizado.' },
                    data: { type: 'object' },
                  }
                }
              }
            } 
          },
          403: { 
            description: 'Forbidden.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 403 },
                    message: { type: 'string', example: 'Usuário sem permissão.' },
                    data: { type: 'object' },
                  }
                }
              }
            } 
          },
          404: { 
            description: 'Not Found.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 404 },
                    message: { type: 'string', example: 'Tipo Papel não encontrado.' },
                    data: { type: 'object' },
                  }
                }
              }
            } 
          },
        }
      }
    }
  )

  .delete('/delete/:id', async ({ params, set, cookie, jwt, getAuthUser, verificaPermissao }) : Promise<APIResponse | APIResponseError> => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
    // verifica se o usuario tem permissão de Admin ou Usuarios
    verificaPermissao(usuario, "ADMINISTRADOR");

    // verifica se o id existe
    const tipoPapelParaDeletar = await prisma.tipoPapeis.findUniqueAtivo({ where: { id: parseInt(params.id) } });
    if (!tipoPapelParaDeletar) {
      return new APIResponseError ({
        status: 404,
        message: 'Tipo Papel não existe.',
        data: null
      });
    }

    // deleta o tipo papel
    const tipoPapelDeletado = await prisma.tipoPapeis.deleteWithAuthUser({
      where: {
        id: parseInt(params.id)
      }
    },
      usuario
    );

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna
    set.status = 200;
    return {
      status: 200,
      message: 'Tipo Papel deletado com sucesso.',
      data: null
    }
  },
    {
      beforeHandle: verificaAuthUser,
      detail: { 
        tags: ['Tipo Papéis'],
        summary: 'Deletar Tipo Papel',
        description: 'Deleta o tipo papel do sistema (Soft Delete).',
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
                    message: { type: 'string', example: 'Tipo Papel deletado com sucesso.' },
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
                    message: { type: 'string', example: 'Não autorizado.' },
                    data: { type: 'object' },
                  }
                }
              }
            } 
          },
          403: { 
            description: 'Forbidden.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 403 },
                    message: { type: 'string', example: 'Usuário sem permissão.' },
                    data: { type: 'object' },
                  }
                }
              }
            } 
          },
          404: { 
            description: 'Not Found.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 404 },
                    message: { type: 'string', example: 'Tipo Papel não encontrado.' },
                    data: { type: 'object' },
                  }
                }
              }
            } 
          },
        }
      }
    }
  )

  .get('/view/:id', async ({ params, set }) : Promise<APIResponse | APIResponseError> => {
    // pega o tipo papel
    const tipoPapel = await prisma.tipoPapeis.findUniqueAtivo({ 
      select : {
        id: true,
        nome: true,
      },
      where: {
        id: parseInt(params.id)
      }
    });

    if (!tipoPapel) {
      return new APIResponseError ({
        status: 404,
        message: 'Tipo Papel não existe.',
        data: null
      });
    }

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o tipo papel
    set.status = 200;
    return {
      status: 200,
      message: 'Tipo Papel encontrado.',
      data: tipoPapel
    }
  },
    {
      detail: { 
        tags: ['Tipo Papéis'],
        summary: 'Visualiza um Tipo Papel',
        description: 'Retorna um tipo papel específico.',
        responses: {
          200: { 
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Tipo Papel encontrado.' },
                    data: { type: 'object' },
                  }
                }
              }
            }
          },
          404: { 
            description: 'Not Found.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 404 },
                    message: { type: 'string', example: 'Tipo Papel não encontrado.' },
                    data: { type: 'object' },
                  }
                }
              }
            } 
          },
        },
      }
    }
  )

  .get('/list', async ({ set }) : Promise<APIResponse> => {
    // pega todos os tipos papels
    const tipoPapeis = await prisma.tipoPapeis.findManyAtivo({ 
      select : {
        id: true,
        nome: true,
      },
      orderBy: { 
        nome: 'asc' 
      } 
    });

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna os tipos papels
    set.status = 200;
    return {
      status: 200,
      message: 'Tipo Papéis encontrados.',
      data: tipoPapeis
    }
  },
    {
      detail: { 
        tags: ['Tipo Papéis'],
        summary: 'Listar Tipo Papéis',
        description: 'Retorna uma lista com todos os tipo papels.',
        responses: {
          200: { 
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Tipo Papéis encontrados.' },
                    data: { type: 'array', items: { type: 'object' } },
                  }
                }
              }
            }
          },
        },
      }
    }
  )