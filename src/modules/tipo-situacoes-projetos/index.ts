import { Elysia, t } from 'elysia';
import { prisma } from '~libs/prisma';
import { authMiddleware, verificaAuthUser } from '~middlewares/auth';
import { Usuarios } from '@prisma/client';
import { APIResponseError } from '~utils/erros';

/**
 * Controller de Tipo Situações Projetos
 */
export const tipoSituacoesProjetosController = new Elysia({ prefix: '/tipo-situacoes-projetos' })

  .use(authMiddleware)

  .post('/add', async ({ body, set, cookie, jwt, getAuthUser, verificaPermissao }) : Promise<APIResponse | APIResponseError> => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
    // verifica se o usuario tem permissão de Admin ou Usuarios
    verificaPermissao(usuario, "ADMINISTRADOR");

    // pega os dados do body
    const { nome } = body;

    // verifica se o tipo situação projeto já existe
    const tipoSituacaoProjetoExiste = await prisma.tipoSituacoesProjetos.findFirstAtivo({ where: { nome } });
    if (tipoSituacaoProjetoExiste) {
      return new APIResponseError ({
        status: 409,
        message: 'Tipo Situação Projeto já existe.',
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

    // cria o novo tipo situação projeto
    const novoTipoSituacaoProjetoCriado = await prisma.tipoSituacoesProjetos.createWithAuthUser({
      data: {
        nome,
      }
    },
      usuario
    );

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o novo tipo situação projeto
    set.status = 201;
    return {
      status: 201,
      message: 'Tipo Situação Projeto criado com sucesso.',
      data: novoTipoSituacaoProjetoCriado
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        nome: t.String(),
      }),
      detail: { 
        tags: ['Tipo Situações Projetos'],
        summary: 'Adicionar Tipo Situação Projeto',
        description: 'Adiciona o novo tipo situação projeto ao banco e retorna os dados do tipo situação projeto.',
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
                    message: { type: 'string', example: 'Tipo Situação Projeto criado com sucesso.' },
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
                    message: { type: 'string', example: 'Tipo Situação Projeto já existe.' },
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
    const tipoSituacaoProjetoParaEditar = await prisma.tipoSituacoesProjetos.findUniqueAtivo({ where: { id: parseInt(params.id) } });
    if (!tipoSituacaoProjetoParaEditar) {
      return new APIResponseError ({
        status: 404,
        message: 'Tipo Situação Projeto não existe.',
        data: null
      });
    }

    const tipoSituacaoProjetoEditado = await prisma.tipoSituacoesProjetos.updateWithAuthUser({
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

    // retorna o tipo situação projeto editado
    set.status = 200;
    return {
      status: 200,
      message: 'Tipo Situação Projeto editado com sucesso.',
      data: tipoSituacaoProjetoEditado
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        nome: t.String(),
      }),
      detail: { 
        tags: ['Tipo Situações Projetos'],
        summary: 'Editar Tipo Situação Projeto',
        description: 'Edita e retorna os dados do tipo situação projeto.',
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
                    message: { type: 'string', example: 'Tipo Situação Projeto editado com sucesso.' },
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
                    message: { type: 'string', example: 'Tipo Situação Projeto não encontrado.' },
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
    const tipoSituacaoProjetoParaDeletar = await prisma.tipoSituacoesProjetos.findUniqueAtivo({ where: { id: parseInt(params.id) } });
    if (!tipoSituacaoProjetoParaDeletar) {
      return new APIResponseError ({
        status: 404,
        message: 'Tipo Situação Projeto não existe.',
        data: null
      });
    }

    // deleta o tipo situação projeto
    const tipoSituacaoProjetoDeletado = await prisma.tipoSituacoesProjetos.deleteWithAuthUser({
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
      message: 'Tipo Situação Projeto deletado com sucesso.',
      data: null
    }
  },
    {
      beforeHandle: verificaAuthUser,
      detail: { 
        tags: ['Tipo Situações Projetos'],
        summary: 'Deletar Tipo Situação Projetos',
        description: 'Deleta o tipo situação projeto do sistema (Soft Delete).',
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
                    message: { type: 'string', example: 'Tipo Situação Projeto deletado com sucesso.' },
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
                    message: { type: 'string', example: 'Tipo Situação Projeto não encontrado.' },
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
    // pega o tipo situação projeto
    const tipoSituacaoProjeto = await prisma.tipoSituacoesProjetos.findUniqueAtivo({ 
      select : {
        id: true,
        nome: true,
      },
      where: {
        id: parseInt(params.id)
      }
    });

    if (!tipoSituacaoProjeto) {
      return new APIResponseError ({
        status: 404,
        message: 'Tipo Situação Projeto não existe.',
        data: null
      });
    }

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o tipo situação projeto
    set.status = 200;
    return {
      status: 200,
      message: 'Tipo Situação Projeto encontrado.',
      data: tipoSituacaoProjeto
    }
  },
    {
      detail: { 
        tags: ['Tipo Situações Projetos'],
        summary: 'Visualiza um Tipo Situação Projeto',
        description: 'Retorna um tipo situação projeto específico.',
        responses: {
          200: { 
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Tipo Situação Projeto encontrado.' },
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
                    message: { type: 'string', example: 'Tipo Situação Projeto não encontrado.' },
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
    // pega todos os tipos situações projetos
    const tipoSituacoesProjetos = await prisma.tipoSituacoesProjetos.findManyAtivo({ 
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

    // retorna os tipos situações projetos
    set.status = 200;
    return {
      status: 200,
      message: 'Tipo Situações Projetos encontrados.',
      data: tipoSituacoesProjetos
    }
  },
    {
      detail: { 
        tags: ['Tipo Situações Projetos'],
        summary: 'Listar Tipo Situações Projetos',
        description: 'Retorna uma lista com todos os tipo situações projetos.',
        responses: {
          200: { 
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Tipo Situações Projetos encontrados.' },
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