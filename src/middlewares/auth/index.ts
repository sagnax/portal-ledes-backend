import Elysia from "elysia";
import { prisma } from "~libs/prisma";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { Usuarios } from "@prisma/client";

/**
 * Tipos de permissões
 * 
 * ADMINISTRADOR: Permissão de Administrador
 * 
 * PROJETOS: Permissão de Projetos
 * 
 * PUBLICACOES: Permissão de Publicações
 * 
 * USUARIOS: Permissão de Usuários
 */
type Permissao = "ADMINISTRADOR" | "PROJETOS" | "PUBLICACOES" | "USUARIOS";

type RetornoGetUsuarioLogadoEPermissão = {
  status: number,
  message: string,
  data: Usuarios | null
} 

/**
 * Middleware de autenticação
 * com o jwt e cookie
 */
const auth = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET!,
    })
  )
  .use(cookie())

/**
 * Função que verifica se o usuário está autenticado e retorna o usuário
 * @param param0 { jwt, cookie: { authToken } } jwt e cookie para verificar o usuário
 * @returns usuário autenticado ou nulo caso não esteja autenticado
 */
async function getAuthUser ({ jwt, cookie: { authToken } }: any) : Promise<Usuarios | null> {
    const user = await jwt.verify(authToken);
    if (!user) {
      return null;
    }
    const usuario = await prisma.usuarios.findFirstAtivo({ where: { id: parseInt(user.id) } });
    return usuario as unknown as Usuarios;
}

/**
 * Função que verifica se o usuário tem a permissão desejada
 * @param usuario usuario que está autenticado
 * @param permissao permisão que se deseja verificar
 * @param idParaEditar id do usuario que se deseja editar
 * @returns true se o usuario tem a permissão, false se não tem
 */
function verificaPermissaoUsuario (usuario: Usuarios, permissao: Permissao, idParaEditarUsuario?: number) : boolean {
  // Verifica se tem permissão de Administrador
  // Apenas tendo a permisão de Administrador, já tem acesso a tudo
  // Se não tiver a permissão de Administrador, verifica se tem a permissão específica
  if (usuario.permissaoAdmin || (usuario.permissaoAdmin && permissao === "ADMINISTRADOR")) {
    return true;
  }
  // Verifica se tem permissão de Projetos
  if (usuario.permissaoProjetos && permissao === "PROJETOS") {
    return true;
  }
  // Verifica se tem permissão de Publicações
  if (usuario.permissaoPublicacoes && permissao === "PUBLICACOES") {
    return true;
  }
  // Verifica se tem permissão de Usuários ou se o usuário é o mesmo que está sendo editado
  if ((usuario.permissaoUsuarios || usuario.id === idParaEditarUsuario) && permissao === "USUARIOS") {
    return true;
  }
  // Se não tiver nenhuma permissão, retorna false
  else {
    return false;
  }
}

export { auth, getAuthUser, verificaPermissaoUsuario };