import Elysia from "elysia";
import { prisma } from "~libs/prisma";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { Usuarios } from "@prisma/client";

const auth = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET!,
    })
  )
  .use(cookie())

async function getAuthUser ({ jwt, cookie: { authToken } }: any) : Promise<Usuarios | null> {
    const user = await jwt.verify(authToken);
    if (!user) {
      return null;
    }
    const usuario = await prisma.usuarios.findFirst({ where: { id: parseInt(user.id) } });
    return usuario as Usuarios;
}

export { auth, getAuthUser };