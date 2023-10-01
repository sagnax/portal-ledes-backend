import { Elysia } from "elysia";
import { auth } from "~modules/auth";

const app = new Elysia({ prefix: "/api" })
  .get("/", (context) => "API Ledes")
  .use(auth)
  .listen(2077);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
