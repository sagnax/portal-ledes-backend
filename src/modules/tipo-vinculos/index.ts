import { Elysia, t } from 'elysia';
import { prisma } from '~libs/prisma';
import { authMiddleware, verificaAuthUser } from '~middlewares/auth';
import { Usuarios } from '@prisma/client';
import { APIResponseError } from '~utils/erros';

/**
 * Controller de Tipo Vínculos
 */
export const tipoVinculosController = new Elysia({ prefix: '/tipo-vinculos' })

  .use(authMiddleware)

  .post('/add', async ({ body, set, cookie, jwt, getAuthUser, verificaPermissao }) : Promise<APIResponse | APIResponseError> => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
    // verifica se o usuario tem permissão de Admin ou Usuarios
    verificaPermissao(usuario, "ADMINISTRADOR");

    // pega os dados do body
    const { nome } = body;

    // verifica se o tipo vinculo já existe
    const tipoVinculoExiste = await prisma.tipoVinculos.findFirstAtivo({ where: { nome } });
    if (tipoVinculoExiste) {
      return new APIResponseError ({
        status: 409,
        message: 'Tipo Vínculo já existe.',
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

    // cria o novo tipo vinculo
    const novoTipoVinculoCriado = await prisma.tipoVinculos.createWithAuthUser({
      data: {
        nome,
      }
    },
      usuario
    );

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o novo tipo vinculo
    set.status = 201;
    return {
      status: 201,
      message: 'Tipo Vínculo criado com sucesso.',
      data: novoTipoVinculoCriado
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        nome: t.String(),
      }),
      detail: { 
        tags: ['Tipo Vínculos'],
        summary: 'Adicionar Tipo Vínculo',
        description: 'Adiciona o novo tipo vínculo ao banco e retorna os dados do tipo vínculo.',
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
                    message: { type: 'string', example: 'Tipo Vínculo criado com sucesso.' },
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
                    message: { type: 'string', example: 'Tipo Vínculo já existe.' },
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
    const tipoVinculoParaEditar = await prisma.tipoVinculos.findUniqueAtivo({ where: { id: parseInt(params.id) } });
    if (!tipoVinculoParaEditar) {
      return new APIResponseError ({
        status: 404,
        message: 'Tipo Vínculo não existe.',
        data: null
      });
    }

    const tipoVinculoEditado = await prisma.tipoVinculos.updateWithAuthUser({
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

    // retorna o tipo vinculo editado
    set.status = 200;
    return {
      status: 200,
      message: 'Tipo Vínculo editado com sucesso.',
      data: tipoVinculoEditado
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        nome: t.String(),
      }),
      detail: { 
        tags: ['Tipo Vínculos'],
        summary: 'Editar Tipo Vínculo',
        description: 'Edita e retorna os dados do tipo vínculo.',
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
                    message: { type: 'string', example: 'Tipo Vínculo editado com sucesso.' },
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
                    message: { type: 'string', example: 'Tipo Vínculo não encontrado.' },
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
    const tipoVinculoParaDeletar = await prisma.tipoVinculos.findUniqueAtivo({ where: { id: parseInt(params.id) } });
    if (!tipoVinculoParaDeletar) {
      return new APIResponseError ({
        status: 404,
        message: 'Tipo Vínculo não existe.',
        data: null
      });
    }

    // deleta o tipo vínculo
    const tipoVinculoDeletado = await prisma.tipoVinculos.deleteWithAuthUser({
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
      message: 'Tipo Vínculo deletado com sucesso.',
      data: null
    }
  },
    {
      beforeHandle: verificaAuthUser,
      detail: { 
        tags: ['Tipo Vínculos'],
        summary: 'Deletar Tipo Vínculo',
        description: 'Deleta o tipo vínculo do sistema (Soft Delete).',
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
                    message: { type: 'string', example: 'Tipo Vínculo deletado com sucesso.' },
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
                    message: { type: 'string', example: 'Tipo Vínculo não encontrado.' },
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
    // pega o tipo vínculo
    const tipoVinculo = await prisma.tipoVinculos.findUniqueAtivo({ 
      select : {
        id: true,
        nome: true,
      },
      where: {
        id: parseInt(params.id)
      }
    });

    if (!tipoVinculo) {
      return new APIResponseError ({
        status: 404,
        message: 'Tipo Vínculo não existe.',
        data: null
      });
    }

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o tipo vínculo
    set.status = 200;
    return {
      status: 200,
      message: 'Tipo Vínculo encontrado.',
      data: tipoVinculo
    }
  },
    {
      detail: { 
        tags: ['Tipo Vínculos'],
        summary: 'Visualiza um Tipo Vínculo',
        description: 'Retorna um tipo vínculo específico.',
        responses: {
          200: { 
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Tipo Vínculo encontrado.' },
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
                    message: { type: 'string', example: 'Tipo Vínculo não encontrado.' },
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
    // pega todos os tipos vínculos
    const tipoVinculos = await prisma.tipoVinculos.findManyAtivo({ 
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

    // retorna os tipos vínculos
    set.status = 200;
    return {
      status: 200,
      message: 'Tipo Vínculos encontrados.',
      data: tipoVinculos
    }
  },
    {
      detail: { 
        tags: ['Tipo Vínculos'],
        summary: 'Listar Tipo Vínculos',
        description: 'Retorna uma lista com todos os tipo vínculos.',
        responses: {
          200: { 
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Tipo Vínculos encontrados.' },
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