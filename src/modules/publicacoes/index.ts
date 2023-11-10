import { Elysia, t } from 'elysia';
import { prisma } from '~libs/prisma';
import { hashTexto } from '~utils/hash';
import { authMiddleware, verificaAuthUser } from '~middlewares/auth';
import { Anexos, Projeto_Usuarios, Projetos, Usuarios } from '@prisma/client';
import { APIResponseError } from '~utils/erros';

/**
 * Controller de publicações
 */
export const publicacoesController = new Elysia({ prefix: '/publicacoes' })

  .use(authMiddleware)

  .post('/add', async ({ body, set, cookie, jwt, getAuthUser, verificaPermissao }) : Promise<APIResponse | APIResponseError> => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
    // verifica se o usuario tem permissão de Admin ou Publicações
    verificaPermissao(usuario, "PUBLICACOES");

    // pega os dados do body
    const { capa, thumbnail, titulo, corpo, destaque, dataAgendamento, visibilidade, anexos } = body;

    // faz um hash do titulo para usar como nome da pasta
    const tituloHash = await hashTexto(titulo);
    
    // salva a capa no servidor
    let capaPath = '';
    if (capa) {
      capaPath = `./public/uploads/img/publicacoes/${tituloHash}/${capa.name}`;
      const capaBuffer = await capa.arrayBuffer();
      const uploaded = await Bun.write(capaPath, capaBuffer);
    }
    else {
      capaPath = `https://placehold.co/1920x1080?text=Capa+Projeto`;
    }

    // salva a thumbnail no servidor
    let thumbnailPath = '';
    if (thumbnail) {
      thumbnailPath = `./public/uploads/img/publicacoes/${tituloHash}/${thumbnail.name}`;
      const thumbnailBuffer = await thumbnail.arrayBuffer();
      const uploaded = await Bun.write(thumbnailPath, thumbnailBuffer);
    }
    else {
      thumbnailPath = `https://placehold.co/1920x1080?text=Capa+Projeto`;
    }

    const agendamento = new Date(dataAgendamento);

    // itera sobre os anexos, salvando-os no servidor
    let anexosSalvosNoServidor: Anexos[] = [];
    for (let i = 0; i < anexos.length; i++) {
      const anexo = anexos[i];
      const anexoPath = `./public/uploads/anexos/publicacoes/${tituloHash}/${anexo.name}`;
      const anexoBuffer = await anexo.arrayBuffer();
      const uploaded = await Bun.write(anexoPath, anexoBuffer);

      if (uploaded){
        const anexoSalvoNoServidor = await prisma.anexos.createWithAuthUser({
          data: {
            titulo: anexo.name,
            nomeArquivo: anexo.name,
            caminhoArquivo: anexoPath,
          }
        },
          usuario
        ) as unknown as Anexos;
        anexosSalvosNoServidor.push(anexoSalvoNoServidor);
      }
    }

    

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o projeto criado
    set.status = 201;
    return {
      status: 201,
      message: 'Projeto criado com sucesso.',
      data: {
        projetoCriado,
        projetoUsuariosCriados
      }
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        capa: t.Optional(t.File({ maxSize: 1024 * 1024 * 2, mimetype: ['image/png', 'image/jpg', 'image/jpeg'] })),
        thumbnail: t.Optional(t.File({ maxSize: 1024 * 1024 * 2, mimetype: ['image/png', 'image/jpg', 'image/jpeg'] })),
        titulo: t.String({ default: 'Notícia A' }),
        corpo: t.String({ default: 'Notícia A sobre Tal Coisa' }),
        destaque: t.Boolean(),
        dataAgendamento: t.String({ default: '01/12/2023' }),
        visibilidade: t.Boolean(),
        anexos: t.Files(),
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
          }
        }
      }
    }
  )

  // .patch('/edit/:id', async ({ params, body, set, cookie, jwt, getAuthUser, verificaPermissao }) : Promise<APIResponse | APIResponseError> => {
  //   // pega o usuario pelo token
  //   const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
  //   // verifica se o usuario tem permissão de Admin ou Projetos
  //   verificaPermissao(usuario, "PROJETOS");

  //   // pega os dados do body
  //   const { foto, titulo, dataInicio, dataTermino, descricao, coordenadorId, situacaoProjetoId, tipoProjetoId } = body;
  //   // pega separado para poder iterar
  //   let { projetoUsuarios } = body;

  //   // verifica se o id existe
  //   const projetoParaEditar = await prisma.projetos.findUniqueAtivo({ where: { id: parseInt(params.id) } });
  //   if (!projetoParaEditar) {
  //     return new APIResponseError ({
  //       status: 404,
  //       message: 'Projeto não existe.',
  //       data: null
  //     });
  //   }

  //   // salva a foto no servidor
  //   let fotoPath = '';
  //   if (foto) {
  //     const tituloHash = Bun.hash(titulo);
  //     fotoPath = `./public/uploads/img/projetos/${tituloHash}/${foto.name}`;
  //     const fotoBuffer = await foto.arrayBuffer();
  //     const uploaded = await Bun.write(fotoPath, fotoBuffer);
  //   }
  //   else {
  //     fotoPath = `https://placehold.co/1920x1080?text=Capa+Projeto`;
  //   }

  //   const inicioProjeto = new Date(dataInicio);
  //   const terminoProjeto = new Date(dataTermino);

  //   // edita o projeto
  //   const projetoEditado = await prisma.projetos.updateWithAuthUser({
  //     data: {
  //       foto: fotoPath,
  //       titulo,
  //       dataInicio: inicioProjeto,
  //       dataTermino: terminoProjeto,
  //       descricao,
  //       coordenador: {
  //         connect: {
  //           id: coordenadorId,
  //         }
  //       },
  //       situacaoProjeto: {
  //         connect: {
  //           id: situacaoProjetoId,
  //         }
  //       },
  //       tipoProjeto: {
  //         connect: {
  //           id: tipoProjetoId,
  //         }
  //       }
  //     },
  //     where: {
  //       id: parseInt(params.id)
  //     }
  //   },
  //     usuario
  //   ) as unknown as Projetos; // Conversão do tipo para poder acessar as propriedades

  //   // busca todos os usuários atuais do projeto
  //   const projetoUsuariosAtuais = await prisma.projeto_Usuarios.findManyAtivo({
  //     where: {
  //       projetoId: parseInt(params.id)
  //     }
  //   }) as unknown as Projeto_Usuarios[]; // Conversão do tipo para poder acessar as propriedades

  //   // iteramos entre todos os usuários atuais do projeto
  //   let projetoUsuariosEditados: Projeto_Usuarios[] = [];
  //   let projetoUsuariosDeletados: Projeto_Usuarios[] = [];
  //   for (let i = 0; i < projetoUsuariosAtuais.length; i++) {
  //     let projetoUsuarioAtual = projetoUsuariosAtuais[i];
  //     // para cada usuário atual, verificamos se ele está na lista de usuários do body com aquela configuração de papel e vinculo
  //     let projetoUsuario: projetoUsuarioType = projetoUsuarios.find(projetoUsuario => projetoUsuario.usuarioId === projetoUsuarioAtual.usuarioId && projetoUsuario.tipoVinculoId === projetoUsuarioAtual.tipoVinculoId && projetoUsuario.tipoPapelId === projetoUsuarioAtual.tipoPapelId);
  //     // se achou, atualiza o usuário
  //     if (projetoUsuario) {
  //       let projetoUsuarioEditado = await prisma.projeto_Usuarios.updateWithAuthUser({
  //         data: {
  //           membroAtivo: projetoUsuario.membroAtivo,
  //         },
  //         where: {
  //           id: projetoUsuarioAtual.id
  //         }
  //       },
  //         usuario
  //       ) as unknown as Projeto_Usuarios;
  //       projetoUsuariosEditados.push(projetoUsuarioEditado);
  //       // remove o usuário da lista de usuários do body
  //       projetoUsuarios.splice(projetoUsuarios.indexOf(projetoUsuario), 1);
  //     }
  //     // se não achou, deleta o usuário
  //     else {
  //       let projetoUsuarioDeletado = await prisma.projeto_Usuarios.deleteWithAuthUser({
  //         where: {
  //           id: projetoUsuarioAtual.id
  //         }
  //       },
  //         usuario
  //       ) as unknown as Projeto_Usuarios;
  //       projetoUsuariosDeletados.push(projetoUsuarioDeletado);
  //     }
  //   }

  //   // adiciona os usuários restantes ao projeto
  //   let projetoUsuariosCriados: Projeto_Usuarios[] = [];
  //   for (let i = 0; i < projetoUsuarios.length; i++) {
  //     let projetoUsuario = projetoUsuarios[i];
  //     let projetoUsuarioCriado = await prisma.projeto_Usuarios.createWithAuthUser({
  //       data: {
  //         projeto: {
  //           connect: {
  //             id: projetoEditado.id,
  //           }
  //         },
  //         usuario: {
  //           connect: {
  //             id: projetoUsuario.usuarioId,
  //           }
  //         },
  //         tipoVinculo: {
  //           connect: {
  //             id: projetoUsuario.tipoVinculoId,
  //           }
  //         },
  //         tipoPapel: {
  //           connect: {
  //             id: projetoUsuario.tipoPapelId,
  //           }
  //         },
  //         dataEntrada: new Date(),
  //         membroAtivo: projetoUsuario.membroAtivo,
  //       }
  //     },
  //       usuario
  //     ) as unknown as Projeto_Usuarios;
  //     projetoUsuariosCriados.push(projetoUsuarioCriado);
  //   }

  //   // desconecta do banco para não deixar a conexão aberta
  //   await prisma.$disconnect();

  //   // retorna o projeto editado
  //   set.status = 200;
  //   return {
  //     status: 200,
  //     message: 'Projeto editado com sucesso.',
  //     data: {
  //       projetoEditado,
  //       projetoUsuariosEditados,
  //       projetoUsuariosDeletados,
  //       projetoUsuariosCriados
  //     }
  //   }
  // },
  //   {
  //     beforeHandle: verificaAuthUser,
  //     body: t.Object({
  //       foto: t.Optional(t.File({ maxSize: 1024 * 1024 * 2, mimetype: ['image/png', 'image/jpg', 'image/jpeg'] })),
  //       titulo: t.String({ default: 'Projeto A' }),
  //       dataInicio: t.String({ default: '01/12/2023' }),
  //       dataTermino: t.String({ default: '01/12/2023' }),
  //       descricao: t.String({ default: 'Projeto A sobre Tal Coisa' }),
  //       coordenadorId: t.Integer(),
  //       situacaoProjetoId: t.Integer(),
  //       tipoProjetoId: t.Integer(),
  //       projetoUsuarios: t.Array(
  //         t.Object({
  //           usuarioId: t.Integer(),
  //           tipoVinculoId: t.Integer(),
  //           tipoPapelId: t.Integer(),
  //           membroAtivo: t.Boolean(),
  //         })
  //       ),
  //     }),
  //     detail: { 
  //       tags: ['Projetos'],
  //       summary: 'Editar Projeto',
  //       description: 'Edita e retorna os dados do projeto.',
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
  //                   message: { type: 'string', example: 'Projeto editado com sucesso.' },
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
  //                   message: { type: 'string', example: 'Projeto não encontrado.' },
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
  //   // verifica se o usuario tem permissão de Admin ou Projetos
  //   verificaPermissao(usuario, "PROJETOS");

  //   // verifica se o id existe
  //   const projetoParaDeletar = await prisma.projetos.findUniqueAtivo({ where: { id: parseInt(params.id) } });
  //   if (!projetoParaDeletar) {
  //     return new APIResponseError ({
  //       status: 404,
  //       message: 'Projeto não existe.',
  //       data: null
  //     });
  //   }

  //   // deleta todos os usuarios do projeto
  //   const projetoUsuariosDeletados = await prisma.projeto_Usuarios.deleteManyWithAuthUser({
  //     where: {
  //       projetoId: parseInt(params.id)
  //     }
  //   },
  //     usuario
  //   );

  //   // deleta o projeto
  //   const projetoDeletado = await prisma.projetos.deleteWithAuthUser({
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
  //     message: 'Projeto deletado com sucesso.',
  //     data: null
  //   }
  // },
  //   {
  //     beforeHandle: verificaAuthUser,
  //     detail: { 
  //       tags: ['Projetos'],
  //       summary: 'Deletar Projeto',
  //       description: 'Deleta o projeto do sistema (Soft Delete).',
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
  //                   message: { type: 'string', example: 'Projeto deletado com sucesso.' },
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
  //                   message: { type: 'string', example: 'Projeto não encontrado.' },
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
  //   // pega o projeto pelo id
  //   const projeto = await prisma.projetos.findUniqueAtivo({ 
  //     select : {
  //       foto: true,
  //       titulo: true,
  //       descricao: true,
  //       dataInicio: true,
  //       dataTermino: true,
  //       coordenador: {
  //         select: {
  //           id: true,
  //           nome: true,
  //           foto: true,
  //         }
  //       },
  //       situacaoProjeto: {
  //         select: {
  //           id: true,
  //           nome: true,
  //         }
  //       },
  //       tipoProjeto: {
  //         select: {
  //           id: true,
  //           nome: true,
  //         }
  //       },
  //       projetoUsuarios: {
  //         select: {
  //           id: true,
  //           membroAtivo: true,
  //           tipoVinculo: {
  //             select: {
  //               id: true,
  //               nome: true,
  //             }
  //           },
  //           tipoPapel: {
  //             select: {
  //               id: true,
  //               nome: true,
  //             }
  //           },
  //           usuario: {
  //             select: {
  //               id: true,
  //               nome: true,
  //               foto: true,
  //             }
  //           }
  //         }
  //       }
  //     },
  //     where: {
  //       id: parseInt(params.id)
  //     }
  //   });

  //   if (!projeto) {
  //     return new APIResponseError ({
  //       status: 404,
  //       message: 'Projeto não existe.',
  //       data: null
  //     });
  //   }

  //   // desconecta do banco para não deixar a conexão aberta
  //   await prisma.$disconnect();

  //   // retorna o projeto
  //   set.status = 200;
  //   return {
  //     status: 200,
  //     message: 'Projeto encontrado.',
  //     data: projeto
  //   }
  // },
  //   {
  //     detail: { 
  //       tags: ['Projetos'],
  //       summary: 'Visualiza um Projeto',
  //       description: 'Retorna um projeto específico.',
  //       responses: {
  //         200: { 
  //           description: 'OK',
  //           content: {
  //             'application/json': {
  //               schema: {
  //                 type: 'object',
  //                 properties: {
  //                   status: { type: 'number', example: 200 },
  //                   message: { type: 'string', example: 'Projeto encontrado.' },
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
  //                   message: { type: 'string', example: 'Projeto não encontrado.' },
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
  //   // pega todos os projetos
  //   const projetos = await prisma.projetos.findManyAtivo({ 
  //     select : {
  //       foto: true,
  //       titulo: true,
  //       descricao: true,
  //       dataInicio: true,
  //       dataTermino: true,
  //       coordenador: {
  //         select: {
  //           id: true,
  //           nome: true,
  //           foto: true,
  //         }
  //       },
  //       situacaoProjeto: {
  //         select: {
  //           id: true,
  //           nome: true,
  //         }
  //       },
  //       tipoProjeto: {
  //         select: {
  //           id: true,
  //           nome: true,
  //         }
  //       },
  //       projetoUsuarios: {
  //         select: {
  //           id: true,
  //           membroAtivo: true,
  //           tipoVinculo: {
  //             select: {
  //               id: true,
  //               nome: true,
  //             }
  //           },
  //           tipoPapel: {
  //             select: {
  //               id: true,
  //               nome: true,
  //             }
  //           },
  //           usuario: {
  //             select: {
  //               id: true,
  //               nome: true,
  //               foto: true,
  //             }
  //           }
  //         }
  //       }
  //     },
  //     orderBy: { 
  //       id: 'asc' 
  //     } 
  //   });

  //   // desconecta do banco para não deixar a conexão aberta
  //   await prisma.$disconnect();

  //   // retorna os usuarios
  //   set.status = 200;
  //   return {
  //     status: 200,
  //     message: 'Projetos encontrados.',
  //     data: projetos
  //   }
  // },
  //   {
  //     detail: { 
  //       tags: ['Projetos'],
  //       summary: 'Listar Projetos',
  //       description: 'Retorna uma lista com todos os projetos.',
  //       responses: {
  //         200: { 
  //           description: 'OK',
  //           content: {
  //             'application/json': {
  //               schema: {
  //                 type: 'object',
  //                 properties: {
  //                   status: { type: 'number', example: 200 },
  //                   message: { type: 'string', example: 'Projetos encontrados.' },
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