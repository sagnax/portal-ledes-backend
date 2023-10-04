import { Elysia } from "elysia";
import { authController } from "~modules/auth";

const app = new Elysia({ prefix: "/api" })
  .onError((context) => {
    console.log(context.error);
  })
  .get("/", (context) => "API Ledes")
  .use(authController)
  .listen(2077);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
