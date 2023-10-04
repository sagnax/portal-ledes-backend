import { Elysia, t } from "elysia";
import { prisma } from "~libs/prisma";
import { hashSenha, verificaSenha, hashEmail } from "~utils/hash"
import { auth as authMiddleware, getAuthUser, verificaPermissaoUsuario } from "~middlewares/auth";

/**
 * Controller de autenticação
 */
export const authController = new Elysia({ prefix: "/auth" })

  .use(authMiddleware)

  .post("/login", async ({ body: { email, password }, set, jwt, setCookie }) => {
    const usuario = await prisma.usuarios.findUnique({ where: { email } });
    // se não existir o usuário
    if (!usuario) {
      set.status = 401;
      return {
        status: 401,
        message: "Usuário e/ou senha incorretos.",
        data: null
      }
    }

    // se encontrar, verifica a senha
    const senhaCorreta = await verificaSenha(password, usuario.senha);
    if (!senhaCorreta) {
      set.status = 401;
      return {
        status: 401,
        message: "Usuário e/ou senha incorretos.",
        data: null
      }
    }
    // se a senha estiver correta, cria o token
    const token = await jwt.sign({ id: usuario.id.toString() });
    // seta o token no cookie
    setCookie("authToken", token, { httpOnly: true, maxAge: 60 });

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o token
    return {
      status: 200,
      message: "Login realizado com sucesso.",
      data: {
        token
      }
    }
  },
    {
      body: t.Object({
        email: t.String(),
        password: t.String()
      })
    }
  )

  .onBeforeHandle(async ({ jwt, set, cookie }) => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, set, cookie });
    if (!usuario) {
      set.status = 401;
      return {
        status: 401,
        message: "Unauthorized",
        data: null
      }
    }
  })

  .post("/signup", async ({ body: { email, password }, set, cookie, jwt }) => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, set, cookie });
    if (!usuario) {
      set.status = 401;
      return {
        status: 401,
        message: "Unauthorized",
        data: null
      }
    }
    // verifica se o usuario tem permissão de Admin ou Usuarios
    const temPermissao = verificaPermissaoUsuario(usuario, "USUARIOS");
    if (!temPermissao) {
      set.status = 403;
      return {
        status: 403,
        message: "Forbidden",
        data: null
      }
    }
    // verifica se o email já existe
    const novoUsuario = await prisma.usuarios.findUnique({ where: { email } });
    if (novoUsuario) {
      set.status = 409;
      return {
        status: 409,
        message: "Usuário já existe.",
        data: null
      }
    }
    // cria o novo usuario
    const hashedSenha = await hashSenha(password);
    const hashedEmail = await hashEmail(email);
    const gravatar = `https://www.gravatar.com/avatar/${hashedEmail}?d=identicon`;
    const novoUsuarioCriado = await prisma.usuarios.createWithAuthUser({
      data: {
        email,
        senha: hashedSenha,
        foto: gravatar,
      }
    },
      usuario
    );

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();

    // retorna o novo usuario
    return {
      status: 201,
      message: "Usuário criado com sucesso.",
      data: novoUsuarioCriado
    }
  },
    {
      body: t.Object({
        email: t.String(),
        password: t.String()
      })
    }
  )

  .get("/teste", async ({ jwt, set, cookie }) => {
    // pega o usuario pelo token
    const usuario = await getAuthUser({ jwt, set, cookie });
    if (!usuario) {
      set.status = 401;
      return {
        status: 401,
        message: "Unauthorized",
        data: null
      }
    }

    // verifica se o usuario tem permissão de Admin ou Usuarios
    const temPermissao = verificaPermissaoUsuario(usuario, "USUARIOS", 23);
    if (!temPermissao) {
      set.status = 403;
      return {
        status: 403,
        message: "Forbidden",
        data: null
      }
    }

    const test = await prisma.usuarios.updateManyWithAuthUser({
      where: { id: { in: [18, 19, 20] } },
      data: {
        nome: "aaa"
      }
    },
      usuario
    )
    console.log(test);

    // desconecta do banco para não deixar a conexão aberta
    await prisma.$disconnect();
    
    return {
      status: 200,
      message: "Teste",
      data: null
    }
  })