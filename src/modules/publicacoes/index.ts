import { Elysia, t } from 'elysia';
import { prisma } from '~libs/prisma';
import { hashTexto } from '~utils/hash';
import { authMiddleware, verificaAuthUser } from '~middlewares/auth';
import { Anexos, Projeto_Usuarios, Projetos, Publicacoes, Usuarios } from '@prisma/client';
import { APIResponseError } from '~utils/erros';
import { mkdirSync, existsSync, readFileSync } from 'fs';

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
    let capaPath = `https://placehold.co/1920x1080?text=Publicacao+Capa`;
    if (capa) {
      // get the blob and save it in the server
      capaPath = `./uploads/img/publicacoes/${capa.name}`;
      const capaBuffer = await capa.arrayBuffer();
      // verifica se a pasta existe
      if (!existsSync(`./uploads/img/publicacoes`)) {
        mkdirSync(`./uploads/img/publicacoes`, { recursive: true });
      }
      const uploaded = await Bun.write(capaPath, capaBuffer);
    }

    // salva a thumbnail no servidor
    let thumbnailPath = `https://placehold.co/1920x1080?text=Publicacao+Thumbnail`;
    if (thumbnail) {
      // get the blob and save it in the server
      thumbnailPath = `./uploads/img/publicacoes/${thumbnail.name}`;
      const thumbnailBuffer = await thumbnail.arrayBuffer();
      // verifica se a pasta existe
      if (!existsSync(`./uploads/img/publicacoes`)) {
        mkdirSync(`./uploads/img/publicacoes`, { recursive: true });
      }
      const uploaded = await Bun.write(thumbnailPath, thumbnailBuffer);
    }

    // itera sobre os anexos, salvando-os no servidor
    // TODO: salvar os anexos
    let anexosSalvosNoServidor: Anexos[] = [];
    // for (let i = 0; i < anexos.length; i++) {
    //   const anexo = anexos[i];
    //   const anexoPath = `./public/uploads/anexos/publicacoes/${tituloHash}/${anexo.name}`;
    //   const anexoBuffer = await anexo.arrayBuffer();
    //   const uploaded = await Bun.write(anexoPath, anexoBuffer);

    //   if (uploaded){
    //     const anexoSalvoNoServidor = await prisma.anexos.createWithAuthUser({
    //       data: {
    //         titulo: anexo.name,
    //         nomeArquivo: anexo.name,
    //         caminhoArquivo: anexoPath,
    //       }
    //     },
    //       usuario
    //     ) as unknown as Anexos;
    //     anexosSalvosNoServidor.push(anexoSalvoNoServidor);
    //   }
    // }

    const agendamento = new Date(dataAgendamento);
    
    const publicacaoCriada = await prisma.publicacoes.createWithAuthUser({
      data: {
        capa: capaPath,
        thumbnail: thumbnailPath,
        titulo,
        corpo,
        autor: {
          connect: {
            id: usuario.id
          }
        },
        destaque,
        dataAgendamento: agendamento,
        visibilidade: visibilidade ? 1 : 0,
        // anexos: {
        //   connect: anexosSalvosNoServidor.map(anexo => ({ id: anexo.id }))
        // }
      }
    },
      usuario
    ) as unknown as Publicacoes;

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o projeto criado
    set.status = 201;
    return {
      status: 201,
      message: 'Publicação criada com sucesso.',
      data: publicacaoCriada
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        capa: t.Optional(t.File({ maxSize: 1024 * 1024 * 2, mimetype: ['image/png', 'image/jpg', 'image/jpeg'] })),
        thumbnail: t.Optional(t.File({ maxSize: 1024 * 1024 * 2, mimetype: ['image/png', 'image/jpg', 'image/jpeg'] })),
        titulo: t.String({ default: 'Notícia A' }),
        corpo: t.String({ default: 'Notícia A sobre Tal Coisa' }),
        destaque: t.Optional(t.Boolean()),
        dataAgendamento: t.String({ default: '01/12/2023' }),
        visibilidade: t.Boolean(),
        anexos: t.Optional(t.Files()),
      }),
      detail: { 
        tags: ['Publicações'],
        summary: 'Adicionar Publicação',
        description: 'Adiciona a nova publicação ao banco e retorna os dados do projeto.',
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
                    message: { type: 'string', example: 'Publicação criado com sucesso.' },
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

  .patch('/edit/:id', async ({ params, body, set, cookie, jwt, getAuthUser, verificaPermissao }) : Promise<APIResponse | APIResponseError> => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
    // verifica se o usuario tem permissão de Admin ou Publicações
    verificaPermissao(usuario, "PUBLICACOES");

    // pega os dados do body
    const { capa, thumbnail, titulo, corpo, destaque, dataAgendamento, visibilidade, anexos } = body;

    // verifica se o id existe
    const publicacaoParaEditar = await prisma.publicacoes.findUniqueAtivo({ where: { id: parseInt(params.id) } }) as unknown as Publicacoes;
    if (!publicacaoParaEditar) {
      return new APIResponseError ({
        status: 404,
        message: 'Publicação não existe.',
        data: null
      });
    }

    // salva a capa no servidor
    let capaPath = `https://placehold.co/1920x1080?text=Publicacao+Capa`;
    if (capa) {
      // get the blob and save it in the server
      capaPath = `./uploads/img/publicacoes/${capa.name}`;
      const capaBuffer = await capa.arrayBuffer();
      // verifica se a pasta existe
      if (!existsSync(`./uploads/img/publicacoes`)) {
        mkdirSync(`./uploads/img/publicacoes`, { recursive: true });
      }
      const uploaded = await Bun.write(capaPath, capaBuffer);
    }

    // salva a thumbnail no servidor
    let thumbnailPath = `https://placehold.co/1920x1080?text=Publicacao+Thumbnail`;
    if (thumbnail) {
      // get the blob and save it in the server
      thumbnailPath = `./uploads/img/publicacoes/${thumbnail.name}`;
      const thumbnailBuffer = await thumbnail.arrayBuffer();
      // verifica se a pasta existe
      if (!existsSync(`./uploads/img/publicacoes`)) {
        mkdirSync(`./uploads/img/publicacoes`, { recursive: true });
      }
      const uploaded = await Bun.write(thumbnailPath, thumbnailBuffer);
    }

    // itera sobre os anexos, salvando-os no servidor
    // TODO: salvar os anexos
    let anexosSalvosNoServidor: Anexos[] = [];
    // for (let i = 0; i < anexos.length; i++) {
    //   const anexo = anexos[i];
    //   const anexoPath = `./public/uploads/anexos/publicacoes/${tituloHash}/${anexo.name}`;
    //   const anexoBuffer = await anexo.arrayBuffer();
    //   const uploaded = await Bun.write(anexoPath, anexoBuffer);

    //   if (uploaded){
    //     const anexoSalvoNoServidor = await prisma.anexos.createWithAuthUser({
    //       data: {
    //         titulo: anexo.name,
    //         nomeArquivo: anexo.name,
    //         caminhoArquivo: anexoPath,
    //       }
    //     },
    //       usuario
    //     ) as unknown as Anexos;
    //     anexosSalvosNoServidor.push(anexoSalvoNoServidor);
    //   }
    // }

    const agendamento = new Date(dataAgendamento);

    // edita o projeto
    const publicacaoEditada = await prisma.publicacoes.updateWithAuthUser({
      data: {
        capa: capa ? capaPath : undefined,
        thumbnail: thumbnail ? thumbnailPath : undefined,
        titulo,
        corpo,
        destaque,
        dataAgendamento: agendamento,
        visibilidade: visibilidade ? 1 : 0,
      },
      where: {
        id: parseInt(params.id)
      }
    },
      usuario
    ) as unknown as Publicacoes; // Conversão do tipo para poder acessar as propriedades

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna a publicação editada
    set.status = 200;
    return {
      status: 200,
      message: 'Publicação editada com sucesso.',
      data: publicacaoEditada
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        capa: t.Optional(t.File({ maxSize: 1024 * 1024 * 2, mimetype: ['image/png', 'image/jpg', 'image/jpeg'] })),
        thumbnail: t.Optional(t.File({ maxSize: 1024 * 1024 * 2, mimetype: ['image/png', 'image/jpg', 'image/jpeg'] })),
        titulo: t.String({ default: 'Notícia A' }),
        corpo: t.String({ default: 'Notícia A sobre Tal Coisa' }),
        destaque: t.Optional(t.Boolean()),
        dataAgendamento: t.String({ default: '01/12/2023' }),
        visibilidade: t.Boolean(),
        anexos: t.Optional(t.Files()),
      }),
      detail: { 
        tags: ['Publicações'],
        summary: 'Editar Publicação',
        description: 'Edita e retorna os dados da publicação.',
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
                    message: { type: 'string', example: 'Publicação editada com sucesso.' },
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
                    message: { type: 'string', example: 'Publicação não encontrada.' },
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
    // verifica se o usuario tem permissão de Admin ou Publicações
    verificaPermissao(usuario, "PUBLICACOES");

    // verifica se o id existe
    const publicacaoParaDeletar = await prisma.publicacoes.findUniqueAtivo({ where: { id: parseInt(params.id) } });
    if (!publicacaoParaDeletar) {
      return new APIResponseError ({
        status: 404,
        message: 'Publicação não existe.',
        data: null
      });
    }

    // deleta a publicação
    const publicacaoDeletado = await prisma.publicacoes.deleteWithAuthUser({
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
      message: 'Publicação deletada com sucesso.',
      data: null
    }
  },
    {
      beforeHandle: verificaAuthUser,
      detail: { 
        tags: ['Publicações'],
        summary: 'Deletar Publicação',
        description: 'Deleta a publicação do sistema (Soft Delete).',
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
                    message: { type: 'string', example: 'Publicação deletada com sucesso.' },
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
                    message: { type: 'string', example: 'Publicação não encontrada.' },
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

  .get('/view/:id', async ({ params, set, cookie, jwt }) : Promise<APIResponse | APIResponseError> => {
    // pega o usuario logado se tiver
    // verifica se o usuario tem permissão de Admin ou Publicações
    // se tiver, pode visualizar todas as publicações
    let podeVisualizarTodasPublicacoes = false;
    const user = await jwt.verify(cookie.authToken);
    if (user) {
      const usuario = await prisma.usuarios.findFirstAtivo({ where: { id: parseInt(user.id) } }) as unknown as Usuarios;
      if (usuario) {
        if (usuario.permissaoAdmin || usuario.permissaoPublicacoes) {
          podeVisualizarTodasPublicacoes = true;
        }
      }
    }

    // pega a publicação pelo id
    const publicacao = await prisma.publicacoes.findUniqueAtivo({ 
      select : {
        id: true,
        capa: true,
        thumbnail: true,
        titulo: true,
        corpo: true,
        autor: {
          select : {
            id: true,
            nome: true,
            sobrenome: true,
            linkedin: true,
            github: true,
            curso: true,
            funcao: true,
            foto: true,
          }
        },
        destaque: true,
        dataAgendamento: true,
        visibilidade: true,
        // anexos: {
        //   select: {
        //     id: true,
        //     titulo: true,
        //     nomeArquivo: true,
        //     caminhoArquivo: true,
        //   }
        // }
      },
      where: {
        id: parseInt(params.id),
        visibilidade: podeVisualizarTodasPublicacoes ? undefined : 1
      }
    }) as unknown as Publicacoes;

    if (!publicacao) {
      return new APIResponseError ({
        status: 404,
        message: 'Publicação não encontrada.',
        data: null
      });
    }

    // pega o caminho da capa da publicação
    const capaPath = publicacao.capa;
    if(capaPath){
      // verifica se a capa é do gravatar
      const isGravatar = capaPath?.includes('placehold');
      // se não for, pega a capa do servidor e transforma em base64 para enviar na resposta
      if (!isGravatar) {
        const capaFile = readFileSync(capaPath);
        const capaBase64 = capaFile.toString('base64');
        publicacao.capa = capaBase64;
      }
    }

    // pega o caminho da thumbnail da publicação
    const thumbnailPath = publicacao.thumbnail;
    if(thumbnailPath){
      // verifica se a thumbnail é do gravatar
      const isGravatar = thumbnailPath?.includes('placehold');
      // se não for, pega a thumbnail do servidor e transforma em base64 para enviar na resposta
      if (!isGravatar) {
        const thumbnailFile = readFileSync(thumbnailPath);
        const thumbnailBase64 = thumbnailFile.toString('base64');
        publicacao.thumbnail = thumbnailBase64;
      }
    }

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o publicação
    set.status = 200;
    return {
      status: 200,
      message: 'Publicação encontrada.',
      data: publicacao
    }
  },
    {
      detail: { 
        tags: ['Publicações'],
        summary: 'Visualiza uma Publicação',
        description: 'Retorna uma publicação específica.',
        responses: {
          200: { 
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Publicação encontrada.' },
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
                    message: { type: 'string', example: 'Publicação não encontrada.' },
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

  .get('/list', async ({ set, cookie, jwt }) : Promise<APIResponse | APIResponseError> => {
    // pega o usuario logado se tiver
    // verifica se o usuario tem permissão de Admin ou Publicações
    // se tiver, pode visualizar todas as publicações
    let podeVisualizarTodasPublicacoes = false;
    const user = await jwt.verify(cookie.authToken);
    if (user) {
      const usuario = await prisma.usuarios.findFirstAtivo({ where: { id: parseInt(user.id) } }) as unknown as Usuarios;
      if (usuario) {
        if (usuario.permissaoAdmin || usuario.permissaoPublicacoes) {
          podeVisualizarTodasPublicacoes = true;
        }
      }
    }
    
    // pega todas as publicações
    const publicacoes = await prisma.publicacoes.findManyAtivo({ 
      select : {
        id: true,
        capa: true,
        thumbnail: true,
        titulo: true,
        corpo: true,
        autor: {
          select : {
            id: true,
            nome: true,
            sobrenome: true,
            linkedin: true,
            github: true,
            curso: true,
            funcao: true,
            foto: true,
          }
        },
        destaque: true,
        dataAgendamento: true,
        visibilidade: true,
        // anexos: {
        //   select: {
        //     id: true,
        //     titulo: true,
        //     nomeArquivo: true,
        //     caminhoArquivo: true,
        //   }
        // }
      },
      where: {
        visibilidade: podeVisualizarTodasPublicacoes ? undefined : 1
      },
      orderBy: { 
        dataAgendamento: 'desc' 
      } 
    }) as unknown as Publicacoes[];

    for (let index = 0; index < publicacoes.length; index++) {
      let publicacao = publicacoes[index];
      // pega o caminho da capa da publicação
      const capaPath = publicacao.capa;
      if(capaPath){
        // verifica se a capa é do gravatar
        const isGravatar = capaPath?.includes('placehold');
        // se não for, pega a capa do servidor e transforma em base64 para enviar na resposta
        if (!isGravatar) {
          const capaFile = readFileSync(capaPath);
          const capaBase64 = capaFile.toString('base64');
          publicacao.capa = capaBase64;
        }
      }

      // pega o caminho da thumbnail da publicação
      const thumbnailPath = publicacao.thumbnail;
      if(thumbnailPath){
        // verifica se a thumbnail é do gravatar
        const isGravatar = thumbnailPath?.includes('placehold');
        // se não for, pega a thumbnail do servidor e transforma em base64 para enviar na resposta
        if (!isGravatar) {
          const thumbnailFile = readFileSync(thumbnailPath);
          const thumbnailBase64 = thumbnailFile.toString('base64');
          publicacao.thumbnail = thumbnailBase64;
        }
      }
    }

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna as publicacoes
    set.status = 200;
    return {
      status: 200,
      message: 'Publicações encontradas.',
      data: publicacoes
    }
  },
    {
      detail: { 
        tags: ['Publicações'],
        summary: 'Listar Publicações',
        description: 'Retorna uma lista com todas as publicações.',
        responses: {
          200: { 
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Publicações encontradas.' },
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

  .post('/destaque/:id', async ({ params, body, set, cookie, jwt, getAuthUser, verificaPermissao }) : Promise<APIResponse | APIResponseError> => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
    // verifica se o usuario tem permissão de Admin ou Publicações
    verificaPermissao(usuario, "PUBLICACOES");

    // pega os dados do body
    const { destaque } = body;

    // verifica se o id existe
    const publicacaoParaEditar = await prisma.publicacoes.findUniqueAtivo({ where: { id: parseInt(params.id) } }) as unknown as Publicacoes;
    if (!publicacaoParaEditar) {
      return new APIResponseError ({
        status: 404,
        message: 'Publicação não existe.',
        data: null
      });
    }

    // edita o projeto
    const publicacaoEditada = await prisma.publicacoes.updateWithAuthUser({
      data: {
        destaque,
      },
      where: {
        id: parseInt(params.id)
      }
    },
      usuario
    ) as unknown as Publicacoes; // Conversão do tipo para poder acessar as propriedades

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna a publicação editada
    set.status = 200;
    return {
      status: 200,
      message: 'Publicação editada com sucesso.',
      data: publicacaoEditada
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        destaque: t.Boolean(),
      }),
      detail: { 
        tags: ['Publicações'],
        summary: 'Destacar Publicação',
        description: 'Destaca ou não a publicação.',
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
                    message: { type: 'string', example: 'Publicação editada com sucesso.' },
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
                    message: { type: 'string', example: 'Publicação não encontrada.' },
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

  .post('/visibilidade/:id', async ({ params, body, set, cookie, jwt, getAuthUser, verificaPermissao }) : Promise<APIResponse | APIResponseError> => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
    // verifica se o usuario tem permissão de Admin ou Publicações
    verificaPermissao(usuario, "PUBLICACOES");

    // pega os dados do body
    const { visibilidade } = body;

    // verifica se o id existe
    const publicacaoParaEditar = await prisma.publicacoes.findUniqueAtivo({ where: { id: parseInt(params.id) } }) as unknown as Publicacoes;
    if (!publicacaoParaEditar) {
      return new APIResponseError ({
        status: 404,
        message: 'Publicação não existe.',
        data: null
      });
    }

    // edita o projeto
    const publicacaoEditada = await prisma.publicacoes.updateWithAuthUser({
      data: {
        visibilidade: visibilidade ? 1 : 0,
      },
      where: {
        id: parseInt(params.id)
      }
    },
      usuario
    ) as unknown as Publicacoes; // Conversão do tipo para poder acessar as propriedades

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna a publicação editada
    set.status = 200;
    return {
      status: 200,
      message: 'Publicação editada com sucesso.',
      data: publicacaoEditada
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        visibilidade: t.Boolean(),
      }),
      detail: { 
        tags: ['Publicações'],
        summary: 'Visibilidade Publicação',
        description: 'Torna a publicação visível ou não.',
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
                    message: { type: 'string', example: 'Publicação editada com sucesso.' },
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
                    message: { type: 'string', example: 'Publicação não encontrada.' },
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