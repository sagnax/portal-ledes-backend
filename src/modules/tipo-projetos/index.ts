import { Elysia, t } from 'elysia';
import { prisma } from '~libs/prisma';
import { hashSenha, hashEmail } from '~utils/hash'
import { validadorSenha, validadorEmail } from '~utils/validadores'
import { authMiddleware, verificaAuthUser } from '~middlewares/auth';
import { Usuarios } from '@prisma/client';
import { APIResponseError } from '~utils/erros';

/**
 * Controller de usuário
 */
export const tipoProjetosController = new Elysia({ prefix: '/tipo-projetos' })

  .use(authMiddleware)

  .post('/add', async ({ body, set, cookie, jwt, getAuthUser, verificaPermissao }) : Promise<APIResponse | APIResponseError> => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
    // verifica se o usuario tem permissão de Admin ou Usuarios
    verificaPermissao(usuario, "ADMINISTRADOR");

    // pega os dados do body
    const { nome } = body;

    // verifica se o tipo projeto já existe
    const tipoProjetoExiste = await prisma.tipoProjetos.findFirstAtivo({ where: { nome } });
    if (tipoProjetoExiste) {
      return new APIResponseError ({
        status: 409,
        message: 'Tipo Projeto já existe.',
        data: null
      });
    }

    // verifica se o email e senha são válidos
    if (nome && nome.length < 3) {
      return new APIResponseError ({
        status: 400,
        message: 'Nome não atende aos requisitos mínimos.',
        data: null
      });
    }

    // cria o novo tip o projeto
    const novoTipoProjetoCriado = await prisma.tipoProjetos.createWithAuthUser({
      data: {
        nome,
      }
    },
      usuario
    );

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o novo tipo projeto
    set.status = 201;
    return {
      status: 201,
      message: 'Tipo Projeto criado com sucesso.',
      data: novoTipoProjetoCriado
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        nome: t.String(),
      }),
      detail: { 
        tags: ['Tipo Projetos'],
        summary: 'Adicionar Tipo Projeto',
        description: 'Adiciona o novo tipo projeto ao banco e retorna os dados do tipo projeto.',
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
                    message: { type: 'string', example: 'Tipo Projeto criado com sucesso.' },
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
                    message: { type: 'string', example: 'Tipo Projeto já existe.' },
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
    const tipoProjetoParaEditar = await prisma.tipoProjetos.findUniqueAtivo({ where: { id: parseInt(params.id) } });
    if (!tipoProjetoParaEditar) {
      return new APIResponseError ({
        status: 404,
        message: 'Tipo Projeto não existe.',
        data: null
      });
    }

    const tipoProjetoEditado = await prisma.tipoProjetos.updateWithAuthUser({
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

    // retorna o tipo projeto editado
    set.status = 200;
    return {
      status: 200,
      message: 'Tipo Projeto editado com sucesso.',
      data: tipoProjetoEditado
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        nome: t.String(),
      }),
      detail: { 
        tags: ['Tipo Projetos'],
        summary: 'Editar Tipo Projeto',
        description: 'Edita e retorna os dados do tipo projeto.',
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
                    message: { type: 'string', example: 'Tipo Projeto editado com sucesso.' },
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
                    message: { type: 'string', example: 'Tipo Projeto não encontrado.' },
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
    const tipoProjetoParaDeletar = await prisma.tipoProjetos.findUniqueAtivo({ where: { id: parseInt(params.id) } });
    if (!tipoProjetoParaDeletar) {
      return new APIResponseError ({
        status: 404,
        message: 'Usuário não existe.',
        data: null
      });
    }

    // deleta o tipo projeto
    const tipoProjetoDeletado = await prisma.tipoProjetos.deleteWithAuthUser({
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
      message: 'Tipo Projeto deletado com sucesso.',
      data: null
    }
  },
    {
      beforeHandle: verificaAuthUser,
      detail: { 
        tags: ['Tipo Projetos'],
        summary: 'Deletar Tipo Projetos',
        description: 'Deleta o tipo projeto do sistema (Soft Delete).',
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
                    message: { type: 'string', example: 'Tipo Projeto deletado com sucesso.' },
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
                    message: { type: 'string', example: 'Tipo Projeto não encontrado.' },
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
    // pega o tipo projeto
    const tipoProjeto = await prisma.tipoProjetos.findUniqueAtivo({ 
      select : {
        id: true,
        nome: true,
      },
      where: {
        id: parseInt(params.id)
      }
    });

    if (!tipoProjeto) {
      return new APIResponseError ({
        status: 404,
        message: 'Tipo Projeto não existe.',
        data: null
      });
    }

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o tipo projeto
    set.status = 200;
    return {
      status: 200,
      message: 'Tipo Projeto encontrado.',
      data: tipoProjeto
    }
  },
    {
      detail: { 
        tags: ['Tipo Projetos'],
        summary: 'Visualiza um Tipo Projeto',
        description: 'Retorna um tipo projeto específico.',
        responses: {
          200: { 
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Tipo Projeto encontrado.' },
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
                    message: { type: 'string', example: 'Tipo Projeto não encontrado.' },
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
    // pega todos os tipos projetos
    const tipoProjetos = await prisma.tipoProjetos.findManyAtivo({ 
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

    // retorna os tipos projetos
    set.status = 200;
    return {
      status: 200,
      message: 'Tipo Projetos encontrados.',
      data: tipoProjetos
    }
  },
    {
      detail: { 
        tags: ['Tipo Projetos'],
        summary: 'Listar Tipo Projetos',
        description: 'Retorna uma lista com todos os tipo Projetos.',
        responses: {
          200: { 
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Tipo Projetos encontrados.' },
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