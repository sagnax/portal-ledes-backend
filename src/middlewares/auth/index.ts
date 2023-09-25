import { Elysia } from "elysia";
import { prisma } from "~libs/prisma";

export const isAuthenticated = (app: Elysia) => 
  app.derive(async ({ cookie, jwt, set }) => {
    console.log(cookie);
    if (!cookie!.token_acesso) {
      set.status = 401;
      return {
        success: false,
        message: "Não autorizado",
        data: null,
      };
    }

    const token = await jwt.verify(cookie!.token_acesso);
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

    return {
      user: usuario,
    };
  });