import { Elysia } from "elysia";
import { auth } from "~modules/auth";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";

const app = new Elysia()
  .group("/api", (app) => {
    return app
      .use(
        jwt({
          name: "jwt",
          secret: Bun.env.JWT_SECRET!,
        })
      )
      .use(cookie())
      .use(auth);
  })
  .listen(2077);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
