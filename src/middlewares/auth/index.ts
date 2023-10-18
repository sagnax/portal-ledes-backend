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
  /** Método para buscar o usuário autenticado */
  .decorate('getAuthUser', (context: any) => {
    return getAuthUser(context);
  })
  .decorate('verificaPermissao', (usuario: Usuarios, permissao: Permissao, id?: number) => {
    return verificaPermissao(usuario, permissao, id);
  })


/**
 * Função que retorna o usuário autenticado.
 * 
 * @param context - { jwt, cookie: { authToken } } - jwt e cookie para verificar o usuário.
 * @returns usuário autenticado ou nulo caso não esteja autenticado.
 */
async function getAuthUser ({ jwt, cookie: { authToken } }: any) : Promise<Usuarios | null> {
    const user = await jwt.verify(authToken);
    if (!user) {
      return null;
    }
    const usuario = await prisma.usuarios.findFirstAtivo({ where: { id: parseInt(user.id) } });
    if (!usuario) {
      return null;
    }
    return usuario as unknown as Usuarios;
}

/**
 * Função para o beforeHandle para verificar se o usuário está autenticado.
 * 
 * @param context - { jwt, cookie: { authToken } } - jwt e cookie para verificar o usuário.
 * @returns Retorna um objeto com o status, message e data caso o usuário não esteja autenticado
 * ou continua o fluxo caso o usuário esteja autenticado.
 */
async function verificaAuthUser ({ set, jwt, cookie: { authToken } }: any) : Promise<APIResponse | void> {
  const user = await jwt.verify(authToken);
  if (!user) {
    console.log('Token inválido.');
    set.status = 401;
    return {
      status: 401,
      message: 'Token inválido.',
      data: null
    };
  }
  const usuario = await prisma.usuarios.findFirstAtivo({ where: { id: parseInt(user.id) } });
  if (!usuario) {
    console.log('Usuário não existe.');
    set.status = 401;
    return {
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
function verificaPermissao (usuario: Usuarios, permissao: Permissao, id?: number) : boolean {
  // Verifica se tem permissão de Administrador
  // Apenas tendo a permisão de Administrador, já tem acesso a tudo
  // Se não tiver a permissão de Administrador, verifica se tem a permissão específica
  if (usuario.permissaoAdmin) {
    return true;
  }
  else if (permissao === "ADMINISTRADOR") {
    return usuario.permissaoAdmin;
  }
  else if (permissao === "PROJETOS") {
    return usuario.permissaoProjetos;
  }
  else if (permissao === "PUBLICACOES") {
    return usuario.permissaoPublicacoes;
  }
  else if (permissao === "USUARIOS") {
    return (usuario.permissaoUsuarios || usuario.id === id);
  }
  else {
    return false;
  }
}

export { authMiddleware, verificaAuthUser, verificaPermissao };