import { Elysia, t } from 'elysia';
import { prisma } from '~libs/prisma';
import { hashSenha, hashEmail } from '~utils/hash'
import { validadorSenha, validadorEmail } from '~utils/validadores'
import { authMiddleware, verificaAuthUser } from '~middlewares/auth';
import { Projetos, Usuarios } from '@prisma/client';
import { APIResponseError } from '~utils/erros';

/**
 * Controller de projetos
 */
export const projetosController = new Elysia({ prefix: '/projetos' })

  .use(authMiddleware)

  .post('/add', async ({ body, set, cookie, jwt, getAuthUser, verificaPermissao }) : Promise<APIResponse | APIResponseError> => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
    // verifica se o usuario tem permissão de Admin ou Projetos
    verificaPermissao(usuario, "PROJETOS");

    // pega os dados do body
    const { titulo, dataInicio, dataTermino, descricao, coordenadorId, situacaoProjetoId, tipoProjetoId, projetoUsuarios} = body;

    const inicioProjeto = new Date(dataInicio);
    const terminoProjeto = new Date(dataTermino);

    // cria o novo projeto
    const novoProjetoCriado = await prisma.projetos.createWithAuthUser({
      data: {
        titulo,
        dataInicio: inicioProjeto,
        dataTermino: terminoProjeto,
        descricao,
        coordenador: {
          connect: {
            id: coordenadorId,
          }
        },
        situacaoProjeto: {
          connect: {
            id: situacaoProjetoId,
          }
        },
        tipoProjeto: {
          connect: {
            id: tipoProjetoId,
          }
        }
      }
    },
      usuario
    ) as unknown as Projetos; // Conversão do tipo para poder acessar as propriedades do Projeto

    // adiciona os membros ao projeto
    let projetoUsuariosCriados = [];
    projetoUsuarios.forEach(async ({usuarioId, tipoVinculoId, tipoPapelId, membroAtivo}) => {
      let projetoUsuarioCriado = await prisma.projeto_Usuarios.createWithAuthUser({
        data: {
          projeto: {
            connect: {
              id: novoProjetoCriado.id,
            }
          },
          usuario: {
            connect: {
              id: usuarioId,
            }
          },
          tipoVinculo: {
            connect: {
              id: tipoVinculoId,
            }
          },
          tipoPapel: {
            connect: {
              id: tipoPapelId,
            }
          },
          dataEntrada: inicioProjeto,
          membroAtivo: membroAtivo,
        }
      },
        usuario
      );
      projetoUsuariosCriados.push(projetoUsuarioCriado);
    });

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o projeto criado
    set.status = 201;
    return {
      status: 201,
      message: 'Projeto criado com sucesso.',
      data: novoProjetoCriado
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        titulo: t.String({default: 'Projeto A'}),
        dataInicio: t.String({default: '01/12/2023'}),
        dataTermino: t.String({default: '01/12/2023'}),
        descricao: t.String({default: 'Projeto A sobre Tal Coisa'}),
        coordenadorId: t.Integer(),
        situacaoProjetoId: t.Integer(),
        tipoProjetoId: t.Integer(),
        projetoUsuarios: t.Array(
          t.Object({
            usuarioId: t.Integer(),
            tipoVinculoId: t.Integer(),
            tipoPapelId: t.Integer(),
            membroAtivo: t.Boolean(),
          })
        ),
      }),
      detail: { 
        tags: ['Projetos'],
        summary: 'Adicionar Projeto',
        description: 'Adiciona o novo projeto ao banco e retorna os dados do projeto.',
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
                    message: { type: 'string', example: 'Projeto criado com sucesso.' },
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

  // .patch('/edit/:id', async ({ params, body, set, cookie, jwt, getAuthUser, verificaPermissao }) : Promise<APIResponse | APIResponseError> => {
  //   // pega o usuario pelo token
  //   const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
  //   // verifica se o usuario tem permissão de Admin ou Usuarios
  //   verificaPermissao(usuario, "USUARIOS", parseInt(params.id));

  //   // pega os dados do body
  //   const { nome, sobrenome, email, password, linkedin, github, curso, funcao, foto, permissaoAdmin, permissaoProjetos, permissaoPublicacoes, permissaoUsuarios } = body;

  //   // verifica se o id existe
  //   const usuarioParaEditar = await prisma.usuarios.findUniqueAtivo({ where: { id: parseInt(params.id) } });
  //   if (!usuarioParaEditar) {
  //     return new APIResponseError ({
  //       status: 404,
  //       message: 'Usuário não existe.',
  //       data: null
  //     });
  //   }

  //   // salva a foto no servidor
  //   let fotoPath = '';
  //   if (foto) {
  //     fotoPath = `./public/uploads/img/usuarios/${email}/${foto.name}`;
  //     const fotoBuffer = await foto.arrayBuffer();
  //     const uploaded = await Bun.write(fotoPath, fotoBuffer);
  //   }
  //   else {
  //     const hashedEmail = await hashEmail(email);
  //     fotoPath = `https://www.gravatar.com/avatar/${hashedEmail}?d=identicon`;
  //   }

  //   // edita o usuario
  //   const hashedSenha = await hashSenha(password);
  //   const usuarioEditado = await prisma.usuarios.updateWithAuthUser({
  //     data: {
  //       nome,
  //       sobrenome,
  //       // email,
  //       senha: hashedSenha,
  //       linkedin,
  //       github,
  //       curso,
  //       funcao,
  //       foto: fotoPath,
  //       permissaoAdmin,
  //       permissaoProjetos,
  //       permissaoPublicacoes,
  //       permissaoUsuarios,
  //     },
  //     where: {
  //       id: parseInt(params.id)
  //     }
  //   },
  //     usuario
  //   );

  //   // desconecta do banco para não deixar a conexão aberta
  //   await prisma.$disconnect();

  //   // retorna o usuario editado
  //   set.status = 200;
  //   return {
  //     status: 200,
  //     message: 'Usuário editado com sucesso.',
  //     data: usuarioEditado
  //   }
  // },
  //   {
  //     beforeHandle: verificaAuthUser,
  //     body: t.Object({
  //       nome: t.Optional(t.String()),
  //       sobrenome: t.Optional(t.String()),
  //       email: t.String(),
  //       password: t.String(),
  //       linkedin: t.Optional(t.String()),
  //       github: t.Optional(t.String()),
  //       curso: t.Optional(t.String()),
  //       funcao: t.Optional(t.Integer()),
  //       foto: t.Optional(t.File({ maxSize: 1024 * 1024 * 2, mimetype: ['image/png', 'image/jpg', 'image/jpeg'] })),
  //       permissaoAdmin: t.Optional(t.Boolean()),
  //       permissaoProjetos: t.Optional(t.Boolean()),
  //       permissaoPublicacoes: t.Optional(t.Boolean()),
  //       permissaoUsuarios: t.Optional(t.Boolean()),
  //     }),
  //     detail: { 
  //       tags: ['Users'],
  //       summary: 'Editar Usuário',
  //       description: 'Edita e retorna os dados do usuário.',
  //       security: [{ cookieAuth: [] }],
  //       responses: {
  //         200: {
  //           description: 'OK.',
  //           content: {
  //             'application/json': {
  //               schema: {
  //                 type: 'object',
  //                 properties: {
  //                   status: { type: 'number', example: 200 },
  //                   message: { type: 'string', example: 'Usuário editado com sucesso.' },
  //                   data: { type: 'object' },
  //                 }
  //               }
  //             }
  //           }
  //         },
  //         401: { 
  //           description: 'Unauthorized.',
  //           content: {
  //             'application/json': {
  //               schema: {
  //                 type: 'object',
  //                 properties: {
  //                   status: { type: 'number', example: 401 },
  //                   message: { type: 'string', example: 'Não autorizado.' },
  //                   data: { type: 'object' },
  //                 }
  //               }
  //             }
  //           } 
  //         },
  //         403: { 
  //           description: 'Forbidden.',
  //           content: {
  //             'application/json': {
  //               schema: {
  //                 type: 'object',
  //                 properties: {
  //                   status: { type: 'number', example: 403 },
  //                   message: { type: 'string', example: 'Usuário sem permissão.' },
  //                   data: { type: 'object' },
  //                 }
  //               }
  //             }
  //           } 
  //         },
  //         404: { 
  //           description: 'Not Found.',
  //           content: {
  //             'application/json': {
  //               schema: {
  //                 type: 'object',
  //                 properties: {
  //                   status: { type: 'number', example: 404 },
  //                   message: { type: 'string', example: 'Usuário não encontrado.' },
  //                   data: { type: 'object' },
  //                 }
  //               }
  //             }
  //           } 
  //         },
  //       }
  //     }
  //   }
  // )

  // .delete('/delete/:id', async ({ params, set, cookie, jwt, getAuthUser, verificaPermissao }) : Promise<APIResponse | APIResponseError> => {
  //   // pega o usuario pelo token
  //   const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
  //   // verifica se o usuario tem permissão de Admin ou Usuarios
  //   verificaPermissao(usuario, "USUARIOS");

  //   // verifica se o id existe
  //   const usuarioParaDeletar = await prisma.usuarios.findUniqueAtivo({ where: { id: parseInt(params.id) } });
  //   if (!usuarioParaDeletar) {
  //     return new APIResponseError ({
  //       status: 404,
  //       message: 'Usuário não existe.',
  //       data: null
  //     });
  //   }

  //   // deleta o usuario
  //   const usuarioDeletado = await prisma.usuarios.deleteWithAuthUser({
  //     where: {
  //       id: parseInt(params.id)
  //     }
  //   },
  //     usuario
  //   );

  //   // desconecta do banco para não deixar a conexão aberta
  //   await prisma.$disconnect();

  //   // retorna
  //   set.status = 200;
  //   return {
  //     status: 200,
  //     message: 'Usuário deletado com sucesso.',
  //     data: null
  //   }
  // },
  //   {
  //     beforeHandle: verificaAuthUser,
  //     detail: { 
  //       tags: ['Users'],
  //       summary: 'Deletar Usuário',
  //       description: 'Deleta o usuário do sistema (Soft Delete).',
  //       security: [{ cookieAuth: [] }],
  //       responses: {
  //         200: {
  //           description: 'OK.',
  //           content: {
  //             'application/json': {
  //               schema: {
  //                 type: 'object',
  //                 properties: {
  //                   status: { type: 'number', example: 200 },
  //                   message: { type: 'string', example: 'Usuário deletado com sucesso.' },
  //                   data: { type: 'object' },
  //                 }
  //               }
  //             }
  //           }
  //         },
  //         401: { 
  //           description: 'Unauthorized.',
  //           content: {
  //             'application/json': {
  //               schema: {
  //                 type: 'object',
  //                 properties: {
  //                   status: { type: 'number', example: 401 },
  //                   message: { type: 'string', example: 'Não autorizado.' },
  //                   data: { type: 'object' },
  //                 }
  //               }
  //             }
  //           } 
  //         },
  //         403: { 
  //           description: 'Forbidden.',
  //           content: {
  //             'application/json': {
  //               schema: {
  //                 type: 'object',
  //                 properties: {
  //                   status: { type: 'number', example: 403 },
  //                   message: { type: 'string', example: 'Usuário sem permissão.' },
  //                   data: { type: 'object' },
  //                 }
  //               }
  //             }
  //           } 
  //         },
  //         404: { 
  //           description: 'Not Found.',
  //           content: {
  //             'application/json': {
  //               schema: {
  //                 type: 'object',
  //                 properties: {
  //                   status: { type: 'number', example: 404 },
  //                   message: { type: 'string', example: 'Usuário não encontrado.' },
  //                   data: { type: 'object' },
  //                 }
  //               }
  //             }
  //           } 
  //         },
  //       }
  //     }
  //   }
  // )

  // .get('/view/:id', async ({ params, set }) : Promise<APIResponse | APIResponseError> => {
  //   // pega todos os usuarios
  //   const usuario = await prisma.usuarios.findUniqueAtivo({ 
  //     select : {
  //       id: true,
  //       nome: true,
  //       sobrenome: true,
  //       linkedin: true,
  //       github: true,
  //       curso: true,
  //       funcao: true,
  //       foto: true,
  //     },
  //     where: {
  //       id: parseInt(params.id)
  //     }
  //   });

  //   if (!usuario) {
  //     return new APIResponseError ({
  //       status: 404,
  //       message: 'Usuário não existe.',
  //       data: null
  //     });
  //   }

  //   // desconecta do banco para não deixar a conexão aberta
  //   await prisma.$disconnect();

  //   // retorna os usuarios
  //   set.status = 200;
  //   return {
  //     status: 200,
  //     message: 'Usuário encontrado.',
  //     data: usuario
  //   }
  // },
  //   {
  //     detail: { 
  //       tags: ['Users'],
  //       summary: 'Visualiza um Usuário',
  //       description: 'Retorna um usuário específico.',
  //       responses: {
  //         200: { 
  //           description: 'OK',
  //           content: {
  //             'application/json': {
  //               schema: {
  //                 type: 'object',
  //                 properties: {
  //                   status: { type: 'number', example: 200 },
  //                   message: { type: 'string', example: 'Usuário encontrado.' },
  //                   data: { type: 'object' },
  //                 }
  //               }
  //             }
  //           }
  //         },
  //         404: { 
  //           description: 'Not Found.',
  //           content: {
  //             'application/json': {
  //               schema: {
  //                 type: 'object',
  //                 properties: {
  //                   status: { type: 'number', example: 404 },
  //                   message: { type: 'string', example: 'Usuário não encontrado.' },
  //                   data: { type: 'object' },
  //                 }
  //               }
  //             }
  //           } 
  //         },
  //       },
  //     }
  //   }
  // )

  // .get('/list', async ({ set }) : Promise<APIResponse> => {
  //   // pega todos os usuarios
  //   const usuarios = await prisma.usuarios.findManyAtivo({ 
  //     select : {
  //       id: true,
  //       nome: true,
  //       sobrenome: true,
  //       linkedin: true,
  //       github: true,
  //       curso: true,
  //       funcao: true,
  //       foto: true,
  //     },
  //     orderBy: { 
  //       nome: 'asc' 
  //     } 
  //   });

  //   // desconecta do banco para não deixar a conexão aberta
  //   await prisma.$disconnect();

  //   // retorna os usuarios
  //   set.status = 200;
  //   return {
  //     status: 200,
  //     message: 'Usuários encontrados.',
  //     data: usuarios
  //   }
  // },
  //   {
  //     detail: { 
  //       tags: ['Users'],
  //       summary: 'Listar Usuários',
  //       description: 'Retorna uma lista com todos os usuários.',
  //       responses: {
  //         200: { 
  //           description: 'OK',
  //           content: {
  //             'application/json': {
  //               schema: {
  //                 type: 'object',
  //                 properties: {
  //                   status: { type: 'number', example: 200 },
  //                   message: { type: 'string', example: 'Usuários encontrados.' },
  //                   data: { type: 'array', items: { type: 'object' } },
  //                 }
  //               }
  //             }
  //           }
  //         },
  //       },
  //     }
  //   }
  // )