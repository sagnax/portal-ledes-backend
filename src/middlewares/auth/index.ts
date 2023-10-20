import Elysia from "elysia";
import { prisma } from "~libs/prisma";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { Usuarios } from "@prisma/client";

/**
 * Tipos de permissões.
 *
 * ADMINISTRADOR: Permissão de Administrador.
 *
 * PROJETOS: Permissão de Projetos.
 *
 * PUBLICACOES: Permissão de Publicações.
 *
 * USUARIOS: Permissão de Usuários.
 */
type Permissao = "ADMINISTRADOR" | "PROJETOS" | "PUBLICACOES" | "USUARIOS";

/**
 * Middleware de autenticação
 * com o jwt e cookie
 */
const authMiddleware = new Elysia()
  // Middleware do Elysia de JWT
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET!,
    })
  )
  // Middleware do Elysia de Cookie
  .use(cookie())
  /** Adiciona o método ao contexto, quando utilizar o authMiddleware */
  .decorate('getAuthUser', (context: any) => {
    return getAuthUser(context);
  })
  /** Adiciona o método ao contexto, quando utilizar o authMiddleware */
  .decorate('verificaPermissao', (usuario: Usuarios, permissao: Permissao, id?: number) => {
    return verificaPermissao(usuario, permissao, id);
  })


/**
 * Função que retorna o usuário autenticado.
 *
 * @param context - { jwt, cookie: { authToken } } - jwt e cookie para verificar o usuário.
 * @returns usuário autenticado ou nulo caso não esteja autenticado.
 */
async function getAuthUser({ jwt, cookie: { authToken } }: any): Promise<Usuarios> {
  const user = await jwt.verify(authToken);
  if (!user) {
    throw {
      status: 401,
      message: 'Token inválido.',
      data: null
    };
  }
  const usuario = await prisma.usuarios.findFirstAtivo({ where: { id: parseInt(user.id) } });
  if (!usuario) {
    throw {
      status: 401,
      message: 'Usuário não existe.',
      data: null };
  }
  return usuario as unknown as Usuarios;
}

/**
 * Função para o beforeHandle para verificar se o usuário está autenticado.
 *
 * @param context - { jwt, cookie: { authToken } } - jwt e cookie para verificar o usuário.
 * @returns Caso o usuário esteja autenticado, continua o fluxo. Caso não esteja, retorna um erro.
 */
async function verificaAuthUser({ set, jwt, cookie: { authToken } }: any): Promise<void> {
  const user = await jwt.verify(authToken);
  if (!user) {
    console.log('Token inválido.');
    throw {
      status: 401,
      message: 'Token inválido.',
      data: null
    };
  }
  const usuario = await prisma.usuarios.findFirstAtivo({ where: { id: parseInt(user.id) } });
  if (!usuario) {
    console.log('Usuário não existe.');
    throw {
      status: 401,
      message: 'Usuário não existe.',
      data: null
    };
  }
  console.log('Usuário está autenticado.');
}

/**
 * Função que verifica se o usuário tem a permissão desejada
 * @param usuario usuario que está autenticado
 * @param permissao permisão que se deseja verificar
 * @param id id do usuario que se deseja editar
 * @returns true se o usuario tem a permissão, false se não tem
 */
function verificaPermissao(usuario: Usuarios, permissao: Permissao, id?: number): boolean {
  let temPermissao = false;
  // Verifica se tem permissão de Administrador
  // Apenas tendo a permisão de Administrador, já tem acesso a tudo
  // Se não tiver a permissão de Administrador, verifica se tem a permissão específica
  if (usuario.permissaoAdmin) {
    temPermissao = true;
  }
  else if (permissao === "ADMINISTRADOR") {
    temPermissao =  usuario.permissaoAdmin;
  }
  else if (permissao === "PROJETOS") {
    temPermissao =  usuario.permissaoProjetos;
  }
  else if (permissao === "PUBLICACOES") {
    temPermissao =  usuario.permissaoPublicacoes;
  }
  else if (permissao === "USUARIOS") {
    temPermissao =  (usuario.permissaoUsuarios || usuario.id === id);
  }
  // Se não tiver a permissão, retorna um erro
  if (temPermissao) {
    return true;
  }
  else {
    throw {
      status: 403,
      message: 'Usuário sem permissão.',
      data: null
    };
  }
}

export { authMiddleware, verificaAuthUser, verificaPermissao };