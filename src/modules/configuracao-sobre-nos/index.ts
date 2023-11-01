import { Elysia, t } from 'elysia';
import { prisma } from '~libs/prisma';
import { authMiddleware, verificaAuthUser } from '~middlewares/auth';
import { Usuarios } from '@prisma/client';
import { APIResponseError } from '~utils/erros';

/**
 * Controller de Configuração Sobre Nós
 */
export const configuracaoSobreNosController = new Elysia({ prefix: '/configuracao-sobre-nos' })

  .use(authMiddleware)

  .patch('/edit/', async ({ body, set, cookie, jwt, getAuthUser, verificaPermissao }) : Promise<APIResponse | APIResponseError> => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
    // verifica se o usuario tem permissão de Admin ou Usuarios
    verificaPermissao(usuario, "ADMINISTRADOR");

    // pega os dados do body
    const { descricao, endereco, coordenadorLaboratorioId, emailCoordenador, telefoneLaboratorio } = body;
    const { segundaLaboratorioAbre, horarioSegundaAbertura, horarioSegundaFechamento } = body;
    const { tercaLaboratorioAbre, horarioTercaAbertura, horarioTercaFechamento } = body;
    const { quartaLaboratorioAbre, horarioQuartaAbertura, horarioQuartaFechamento } = body;
    const { quintaLaboratorioAbre, horarioQuintaAbertura, horarioQuintaFechamento } = body;
    const { sextaLaboratorioAbre, horarioSextaAbertura, horarioSextaFechamento } = body;
    const { sabadoLaboratorioAbre, horarioSabadoAbertura, horarioSabadoFechamento } = body;
    const { domingoLaboratorioAbre, horarioDomingoAbertura, horarioDomingoFechamento } = body;

    // verifica se o primeiro registro existe no banco, se não existir, cria
    const configuracaoSobreNos = await prisma.configuracaoSobreNos.upsertWithAuthUser({
      where: { id: 1 },
      update: {
        descricao,
        endereco,
        coordenadorLaboratorio: {
          connect: {
            id: coordenadorLaboratorioId
          }
        },
        emailCoordenador,
        telefoneLaboratorio,
        segundaLaboratorioAbre,
        horarioSegundaAbertura,
        horarioSegundaFechamento,
        tercaLaboratorioAbre,
        horarioTercaAbertura,
        horarioTercaFechamento,
        quartaLaboratorioAbre,
        horarioQuartaAbertura,
        horarioQuartaFechamento,
        quintaLaboratorioAbre,
        horarioQuintaAbertura,
        horarioQuintaFechamento,
        sextaLaboratorioAbre,
        horarioSextaAbertura,
        horarioSextaFechamento,
        sabadoLaboratorioAbre,
        horarioSabadoAbertura,
        horarioSabadoFechamento,
        domingoLaboratorioAbre,
        horarioDomingoAbertura,
        horarioDomingoFechamento,
      },
      create: {
        descricao,
        endereco,
        coordenadorLaboratorio: {
          connect: {
            id: coordenadorLaboratorioId
          }
        },
        emailCoordenador,
        telefoneLaboratorio,
        segundaLaboratorioAbre,
        horarioSegundaAbertura,
        horarioSegundaFechamento,
        tercaLaboratorioAbre,
        horarioTercaAbertura,
        horarioTercaFechamento,
        quartaLaboratorioAbre,
        horarioQuartaAbertura,
        horarioQuartaFechamento,
        quintaLaboratorioAbre,
        horarioQuintaAbertura,
        horarioQuintaFechamento,
        sextaLaboratorioAbre,
        horarioSextaAbertura,
        horarioSextaFechamento,
        sabadoLaboratorioAbre,
        horarioSabadoAbertura,
        horarioSabadoFechamento,
        domingoLaboratorioAbre,
        horarioDomingoAbertura,
        horarioDomingoFechamento,
      }
    },
      usuario
    );

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna a configuração sobre nós
    set.status = 200;
    return {
      status: 200,
      message: 'Configuração Sobre Nós criado/editado com sucesso.',
      data: configuracaoSobreNos
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        descricao: t.Optional(t.String()),
        endereco: t.Optional(t.String()), 
        coordenadorLaboratorioId: t.Optional(t.Integer()), 
        emailCoordenador: t.Optional(t.String()), 
        telefoneLaboratorio: t.Optional(t.String()),
        segundaLaboratorioAbre: t.Optional(t.Boolean()),
        horarioSegundaAbertura: t.Optional(t.String()),
        horarioSegundaFechamento: t.Optional(t.String()),
        tercaLaboratorioAbre: t.Optional(t.Boolean()),
        horarioTercaAbertura: t.Optional(t.String()),
        horarioTercaFechamento: t.Optional(t.String()),
        quartaLaboratorioAbre: t.Optional(t.Boolean()),
        horarioQuartaAbertura: t.Optional(t.String()),
        horarioQuartaFechamento: t.Optional(t.String()),
        quintaLaboratorioAbre: t.Optional(t.Boolean()),
        horarioQuintaAbertura: t.Optional(t.String()),
        horarioQuintaFechamento: t.Optional(t.String()),
        sextaLaboratorioAbre: t.Optional(t.Boolean()),
        horarioSextaAbertura: t.Optional(t.String()),
        horarioSextaFechamento: t.Optional(t.String()),
        sabadoLaboratorioAbre: t.Optional(t.Boolean()),
        horarioSabadoAbertura: t.Optional(t.String()),
        horarioSabadoFechamento: t.Optional(t.String()),
        domingoLaboratorioAbre: t.Optional(t.Boolean()),
        horarioDomingoAbertura: t.Optional(t.String()),
        horarioDomingoFechamento: t.Optional(t.String()),
      }),
      detail: { 
        tags: ['Configuração Sobre Nós'],
        summary: 'Criar/Editar Configuração Sobre Nós',
        description: 'Cria ou Edita e retorna os dados da configuração sobre nós.',
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
                    message: { type: 'string', example: 'Configuração Sobre Nós criado/editado com sucesso.' },
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
        }
      }
    }
  )

  .get('/view/', async ({ set }) : Promise<APIResponse | APIResponseError> => {
    // pega a configuração sobre nós
    const configuracaoSobreNos = await prisma.configuracaoSobreNos.findUniqueAtivo({ 
      where: {
        id: 1
      }
    });

    if (!configuracaoSobreNos) {
      return new APIResponseError ({
        status: 404,
        message: 'Configuração Sobre Nós não encontrada, edite-a primeiro.',
        data: null
      });
    }

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o tipo papel
    set.status = 200;
    return {
      status: 200,
      message: 'Configuração Sobre Nós encontrada.',
      data: configuracaoSobreNos
    }
  },
    {
      detail: { 
        tags: ['Configuração Sobre Nós'],
        summary: 'Visualiza a Configuração Sobre Nós',
        description: 'Retorna a Configuração Sobre Nós.',
        responses: {
          200: { 
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Configuração Sobre Nós encontrada.' },
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
                    message: { type: 'string', example: 'Configuração Sobre Nós não encontrada, edite-a primeiro.' },
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