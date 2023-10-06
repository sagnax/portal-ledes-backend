import { Elysia } from "elysia";
import { authController } from "~modules/auth";
import { userController } from "~modules/user";

const app = new Elysia({ prefix: "/api" })
  .onError((context) => {
    console.log(context.error);
    if ('status' in context.error) {
      context.set.status = context.error.status;
    } else {
      context.set.status = 500;
    }
    return {
      status: context.set.status,
      message: "Error",
      data: null,
    }
  })
  .get("/", (context) => "API Ledes")
  .use(authController)
  .use(userController)
  .listen(2077);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
