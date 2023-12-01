import { Elysia, t } from 'elysia';
import { prisma } from '~libs/prisma';
import { hashSenha, hashEmail } from '~utils/hash'
import { validadorSenha, validadorEmail } from '~utils/validadores'
import { authMiddleware, verificaAuthUser } from '~middlewares/auth';
import { Usuarios } from '@prisma/client';
import { APIResponseError } from '~utils/erros';
import { mkdirSync, existsSync, readFileSync } from 'fs';

/**
 * Controller de usuário
 */
export const usersController = new Elysia({ prefix: '/users' })

  .use(authMiddleware)

  .post('/add', async ({ body, set, cookie, jwt, getAuthUser, verificaPermissao }) : Promise<APIResponse | APIResponseError> => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, cookie }) as Usuarios;
    // verifica se o usuario tem permissão de Admin ou Usuarios
    verificaPermissao(usuario, "USUARIOS");

    // pega os dados do body
    const { nome, sobrenome, email, password, linkedin, github, curso, funcao, foto, permissaoAdmin, permissaoProjetos, permissaoPublicacoes, permissaoUsuarios } = body;

    // verifica se o email e senha são válidos
    if (!validadorEmail(email) || !validadorSenha(password)) {
      return new APIResponseError ({
        status: 400,
        message: 'Email e/ou Senha não atende aos requisitos mínimos.',
        data: null
      });
    }

    // verifica se o email já existe
    const novoUsuario = await prisma.usuarios.findUnique({ where: { email } });
    if (novoUsuario) {
      return new APIResponseError ({
        status: 409,
        message: 'Usuário já existe.',
        data: null
      });
    }

    // salva a foto no servidor
    let fotoPath = '';
    const hashedEmail = await hashEmail(email);
    const smallHashedEmail = hashedEmail.slice(0, 10);
    if (foto) {
      // get the blob and save it in the server
      fotoPath = `./uploads/img/usuarios/${smallHashedEmail}/${foto.name}`;
      const fotoBuffer = await foto.arrayBuffer();
      // verifica se a pasta existe
      if (!existsSync(`./uploads/img/usuarios/${smallHashedEmail}`)) {
        mkdirSync(`./uploads/img/usuarios/${smallHashedEmail}`, { recursive: true });
      }
      const uploaded = await Bun.write(fotoPath, fotoBuffer);
    }
    else {
      fotoPath = `https://www.gravatar.com/avatar/${hashedEmail}?d=identicon`;
    }

    // cria o novo usuario
    const hashedSenha = await hashSenha(password);
    const novoUsuarioCriado = await prisma.usuarios.createWithAuthUser({
      data: {
        nome,
        sobrenome,
        email,
        senha: hashedSenha,
        linkedin,
        github,
        curso,
        funcao,
        foto: fotoPath,
        permissaoAdmin,
        permissaoProjetos,
        permissaoPublicacoes,
        permissaoUsuarios,
      }
    },
      usuario
    );

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o novo usuario
    set.status = 201;
    return {
      status: 201,
      message: 'Usuário criado com sucesso.',
      data: novoUsuarioCriado
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        nome: t.Optional(t.String()),
        sobrenome: t.Optional(t.String()),
        email: t.String({ default: 'teste@gmail.com' }),
        password: t.String({ default: '!Abcde12345' }),
        linkedin: t.Optional(t.String({ default: 'https://linkedin.com/perfil' })),
        github: t.Optional(t.String({ default: 'https://github.com/perfil' })),
        curso: t.Optional(t.String()),
        funcao: t.Optional(t.Integer()),
        foto: t.Optional(t.File({ maxSize: 1024 * 1024 * 2, mimetype: ['image/png', 'image/jpg', 'image/jpeg'] })),
        permissaoAdmin: t.Optional(t.Boolean()),
        permissaoProjetos: t.Optional(t.Boolean()),
        permissaoPublicacoes: t.Optional(t.Boolean()),
        permissaoUsuarios: t.Optional(t.Boolean()),
      }),
      detail: { 
        tags: ['Users'],
        summary: 'Adicionar Usuário',
        description: 'Adiciona o novo usuário ao banco e retorna os dados do usuário.',
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
                    message: { type: 'string', example: 'Usuário criado com sucesso.' },
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
                    message: { type: 'string', example: 'Email e/ou Senha não atende aos requisitos mínimos.' },
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
                    message: { type: 'string', example: 'Usuário já existe.' },
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
    verificaPermissao(usuario, "USUARIOS", parseInt(params.id));

    // pega os dados do body
    const { nome, sobrenome, email, password, linkedin, github, curso, funcao, foto, permissaoAdmin, permissaoProjetos, permissaoPublicacoes, permissaoUsuarios } = body;

    // verifica se o id existe
    const usuarioParaEditar = await prisma.usuarios.findUniqueAtivo({ where: { id: parseInt(params.id) } }) as unknown as Usuarios;
    if (!usuarioParaEditar) {
      return new APIResponseError ({
        status: 404,
        message: 'Usuário não existe.',
        data: null
      });
    }

    // salva a foto no servidor
    let fotoPath = '';
    const hashedEmail = await hashEmail(email ?? usuarioParaEditar.email);
    const smallHashedEmail = hashedEmail.slice(0, 10);
    if (foto) {
      // get the blob and save it in the server
      fotoPath = `./uploads/img/usuarios/${smallHashedEmail}/${foto.name}`;
      const fotoBuffer = await foto.arrayBuffer();
      // verifica se a pasta existe
      if (!existsSync(`./uploads/img/usuarios/${smallHashedEmail}`)) {
        mkdirSync(`./uploads/img/usuarios/${smallHashedEmail}`, { recursive: true });
      }
      const uploaded = await Bun.write(fotoPath, fotoBuffer);
    }
    else {
      fotoPath = `https://www.gravatar.com/avatar/${hashedEmail}?d=identicon`;
    }

    // edita o usuario
    const hashedSenha = password ? (await hashSenha(password)) : (usuarioParaEditar.senha);
    const usuarioEditado = await prisma.usuarios.updateWithAuthUser({
      data: {
        nome,
        sobrenome,
        // email,
        senha: hashedSenha,
        linkedin,
        github,
        curso,
        funcao,
        foto: foto ? fotoPath : undefined,
        permissaoAdmin,
        permissaoProjetos,
        permissaoPublicacoes,
        permissaoUsuarios,
      },
      where: {
        id: parseInt(params.id)
      },
      select: {
        id: true,
        nome: true,
        sobrenome: true,
        email: true,
        linkedin: true,
        github: true,
        curso: true,
        funcao: true,
        foto: true,
        permissaoAdmin: true,
        permissaoProjetos: true,
        permissaoPublicacoes: true,
        permissaoUsuarios: true,
      }
    },
      usuario
    );


    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o usuario editado
    set.status = 200;
    return {
      status: 200,
      message: 'Usuário editado com sucesso.',
      data: usuarioEditado
    }
  },
    {
      beforeHandle: verificaAuthUser,
      body: t.Object({
        nome: t.Optional(t.String()),
        sobrenome: t.Optional(t.String()),
        email: t.Optional(t.String({ default: 'teste@gmail.com' })),
        password: t.Optional(t.String({ default: '!Abcde12345' })),
        linkedin: t.Optional(t.String({ default: 'https://linkedin.com/perfil' })),
        github: t.Optional(t.String({ default: 'https://github.com/perfil' })),
        curso: t.Optional(t.String()),
        funcao: t.Optional(t.Integer()),
        foto: t.Optional(t.File({ maxSize: 1024 * 1024 * 2, mimetype: ['image/png', 'image/jpg', 'image/jpeg'] })),
        permissaoAdmin: t.Optional(t.Boolean()),
        permissaoProjetos: t.Optional(t.Boolean()),
        permissaoPublicacoes: t.Optional(t.Boolean()),
        permissaoUsuarios: t.Optional(t.Boolean()),
      }),
      detail: { 
        tags: ['Users'],
        summary: 'Editar Usuário',
        description: 'Edita e retorna os dados do usuário.',
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
                    message: { type: 'string', example: 'Usuário editado com sucesso.' },
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
                    message: { type: 'string', example: 'Usuário não encontrado.' },
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
    verificaPermissao(usuario, "USUARIOS");

    // verifica se o id existe
    const usuarioParaDeletar = await prisma.usuarios.findUniqueAtivo({ where: { id: parseInt(params.id) } });
    if (!usuarioParaDeletar) {
      return new APIResponseError ({
        status: 404,
        message: 'Usuário não existe.',
        data: null
      });
    }

    // deleta o usuario
    const usuarioDeletado = await prisma.usuarios.deleteWithAuthUser({
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
      message: 'Usuário deletado com sucesso.',
      data: null
    }
  },
    {
      beforeHandle: verificaAuthUser,
      detail: { 
        tags: ['Users'],
        summary: 'Deletar Usuário',
        description: 'Deleta o usuário do sistema (Soft Delete).',
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
                    message: { type: 'string', example: 'Usuário deletado com sucesso.' },
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
                    message: { type: 'string', example: 'Usuário não encontrado.' },
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
    // pega todos os usuarios
    const usuario = await prisma.usuarios.findUniqueAtivo({ 
      select : {
        id: true,
        nome: true,
        sobrenome: true,
        linkedin: true,
        github: true,
        curso: true,
        funcao: true,
        foto: true,
        projetoUsuarios: {
          select: {
            id: true,
            projeto: {
              select: {
                id: true,
                foto: true,
                titulo: true,
                descricao: true,
                dataInicio: true,
                dataTermino: true,
                coordenador: {
                  select: {
                    id: true,
                    nome: true,
                    sobrenome: true,
                    curso: true,
                    funcao: true,
                    foto: true,
                  } 
                },
                situacaoProjeto: {
                  select: {
                    id: true,
                    nome: true,
                  }
                },
                tipoProjeto: {
                  select: {
                    id: true,
                    nome: true,
                  }
                }
              }
            },
            dataEntrada: true,
            dataSaida: true,
            tipoVinculo: {
              select: {
                id: true,
                nome: true,
              }
            },
            tipoPapel: {
              select: {
                id: true,
                nome: true,
              }
            },
            membroAtivo: true,
          }
        }
      },
      where: {
        id: parseInt(params.id)
      }
    }) as unknown as Usuarios;

    if (!usuario) {
      return new APIResponseError ({
        status: 404,
        message: 'Usuário não existe.',
        data: null
      });
    }

    // pega o caminho da foto do usuario
    const fotoPath = usuario.foto;
    if(fotoPath){
      // verifica se a foto é do gravatar
      const isGravatar = fotoPath?.includes('gravatar');
      // se não for, pega a foto do servidor e transforma em base64 para enviar na resposta
      if (!isGravatar) {
        const fotoFile = readFileSync(fotoPath);
        const fotoBase64 = fotoFile.toString('base64');
        usuario.foto = fotoBase64;
      }
    }

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna os usuarios
    set.status = 200;
    return {
      status: 200,
      message: 'Usuário encontrado.',
      data: usuario
    }
  },
    {
      detail: { 
        tags: ['Users'],
        summary: 'Visualiza um Usuário',
        description: 'Retorna um usuário específico.',
        responses: {
          200: { 
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Usuário encontrado.' },
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
                    message: { type: 'string', example: 'Usuário não encontrado.' },
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
    // pega todos os usuarios
    const usuarios = await prisma.usuarios.findManyAtivo({ 
      select : {
        id: true,
        nome: true,
        sobrenome: true,
        linkedin: true,
        github: true,
        curso: true,
        funcao: true,
        foto: true,
        projetoUsuarios: {
          select: {
            id: true,
            projeto: {
              select: {
                id: true,
                foto: true,
                titulo: true,
                descricao: true,
                dataInicio: true,
                dataTermino: true,
                coordenador: {
                  select: {
                    id: true,
                    nome: true,
                    sobrenome: true,
                    curso: true,
                    funcao: true,
                    foto: true,
                  } 
                },
                situacaoProjeto: {
                  select: {
                    id: true,
                    nome: true,
                  }
                },
                tipoProjeto: {
                  select: {
                    id: true,
                    nome: true,
                  }
                }
              }
            },
            dataEntrada: true,
            dataSaida: true,
            tipoVinculo: {
              select: {
                id: true,
                nome: true,
              }
            },
            tipoPapel: {
              select: {
                id: true,
                nome: true,
              }
            },
            membroAtivo: true,
          }
        }
      },
      orderBy: { 
        nome: 'asc' 
      } 
    }) as unknown as Usuarios[];

    for (let index = 0; index < usuarios.length; index++) {
      let usuario = usuarios[index];
      // pega o caminho da foto do usuario
      const fotoPath = usuario.foto;
      if(fotoPath){
        // verifica se a foto é do gravatar
        const isGravatar = fotoPath?.includes('gravatar');
        // se não for, pega a foto do servidor e transforma em base64 para enviar na resposta
        if (!isGravatar) {
          const fotoFile = readFileSync(fotoPath);
          const fotoBase64 = fotoFile.toString('base64');
          usuario.foto = fotoBase64;
        }
      }
    }

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna os usuarios
    set.status = 200;
    return {
      status: 200,
      message: 'Usuários encontrados.',
      data: usuarios
    }
  },
    {
      detail: { 
        tags: ['Users'],
        summary: 'Listar Usuários',
        description: 'Retorna uma lista com todos os usuários.',
        responses: {
          200: { 
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Usuários encontrados.' },
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