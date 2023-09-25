import { Elysia, t } from "elysia";
import { prisma } from "~libs/prisma";
import { hashSenha, verificaSenha, hashEmail } from "~utils/hash";
import { isAuthenticated } from "~middlewares/auth";

export const auth = (app: Elysia) => {
  return app
    .group("/auth", (app) => {
      return app

        .post("/signup", async ({ body, set }) => {
          const { email, senha } = body;

          // Verifica se o usuário já existe
          const usuarioExiste = await prisma.usuarios.findUnique({
            where: { email },
            select: { id: true },
          });
          if (usuarioExiste) {
            set.status = 400;
            return {
              success: false,
              message: "Usuário com esse e-mail já existe",
              data: null,
            }
          }

          // Faz o hash da senha e do e-mail
          const senhaHash = await hashSenha(senha);
          const emailHash = await hashEmail(email);
          const fotoURL = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;

          // Cria o usuário novo com as informações básicas
          const novoUsuario = await prisma.usuarios.create({
            data: {
              email: email,
              senha: senhaHash,
              foto: fotoURL,
            }
          });

          // Retorna o usuário criado
          return {
            success: true,
            message: "Usuário criado com sucesso",
            data: {
              user: novoUsuario,
            }
          }
        },
          {
            body: t.Object({
              email: t.String(),
              senha: t.String(),
            })
          })
        .post("/login", async ({ body, set, jwt, setCookie }) => {
          const { email, senha } = body;

          // Verifica se o usuário existe
          const usuario = await prisma.usuarios.findFirst({
            where: { email },
            select: { id: true, senha: true },
          });
          if (!usuario) {
            set.status = 400;
            return {
              success: false,
              message: "Usuário não existe",
              data: null,
            }
          }

          // Verifica se a senha está correta
          const senhaCorreta = await verificaSenha(senha, usuario.senha);
          if (!senhaCorreta) {
            set.status = 400;
            return {
              success: false,
              message: "Senha incorreta",
              data: null,
            }
          }

          // Gera o token JWT
          const token = await jwt.sign({ id: usuario.id });

          // Seta o cookie com o token
          setCookie("token_acesso", token, {
            maxAge: 60 * 60, // 1 hora
            path: "/",
          })

          // Retorna o usuário
          return {
            success: true,
            message: "Usuário logado com sucesso",
            data: {
              user: usuario,
            }
          }
        }, {
          body: t.Object({
            email: t.String(),
            senha: t.String(),
          })
        })
        .use(isAuthenticated)
        .get("/me", async ({ user }) => {
          return {
            success: true,
            message: "Usuário encontrado",
            data: {
              user,
            }
          }
        });
    });
};