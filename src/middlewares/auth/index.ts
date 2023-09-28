import { Elysia } from "elysia";
import { prisma } from "~libs/prisma";

export const isAuthenticated = (app: Elysia) =>  {
  return app.derive(async ({ cookie, jwt, set }) => {
    if (!cookie.token_acesso) {
      console.log("Não autorizado1");
      set.status = 401;
      return {
        success: false,
        message: "Não autorizado",
        data: null,
      };
    }

    const token = await jwt.verify(cookie.token_acesso);
    if (!token) {
      set.status = 401;
      return {
        success: false,
        message: "Não autorizado",
        data: null,
      };
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { id: token.id },
    });
    if (!usuario) {
      set.status = 401;
      return {
        success: false,
        message: "Não autorizado",
        data: null,
      };
    }
    else {
      return {
        success: true,
        message: "Usuário autenticado",
        data: {
          user: usuario,
        }
      }
    }
  });
};