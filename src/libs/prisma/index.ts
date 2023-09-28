import { Prisma, PrismaClient } from "@prisma/client";
import { isAuthenticated } from "~middlewares/auth";

const prisma = new PrismaClient().$extends({
  // Estende o tipo do prisma para adicionar o método exists
  model: {
    $allModels: {
      async exists<T>( this: T, where: Prisma.Args<T, 'findFirst'>['where'] ): Promise<boolean> {
        const context = Prisma.getExtensionContext(this);
        const result = await (context as any).findFirst({ where, select: { id: true } });
        return result !== null;
      }
    }
  }
}).$extends({
  // Estende o tipo do prisma para adicionar o método findManyWithPagination
  model: {
    $allModels: {
      async findManyWithPagination<T>( this: T, { page, perPage, orderBy, where, select }: Prisma.Args<T, 'findMany'> ): Promise<{ data: T[], count: number }> {
        const context = Prisma.getExtensionContext(this);
        const data = await (context as any).findMany({ skip: (page - 1) * perPage, take: perPage, orderBy, where, select });
        const count = await (context as any).count({ where });
        return { data, count };
      }
    }
  }
}).$extends({
  // Estende o PrismaClient para atualizar os campos userCreatedId e userUpdatedId automaticamente
  model: {
    $allModels: {
      async create<T>( this: T, { data, ...args }: Prisma.Args<T, 'create'> ): Promise<T> {
        const context = Prisma.getExtensionContext(this);
        const userAuth = await isAuthenticated(context as any);
        const result = await (context as any).create({ data: { ...data, userCreatedId }, ...args });
        return result;
      },
      async update<T>( this: T, { where, data, ...args }: Prisma.Args<T, 'update'> ): Promise<T> {
        const context = Prisma.getExtensionContext(this);
        const userUpdatedId = (context as any).ctx.user?.id;
        const result = await (context as any).update({ where, data: { ...data, userUpdatedId }, ...args });
        return result;
      },
      async upsert<T>( this: T, { where, create, update, ...args }: Prisma.Args<T, 'upsert'> ): Promise<T> {
        const context = Prisma.getExtensionContext(this);
        const userCreatedId = (context as any).ctx.user?.id;
        const userUpdatedId = (context as any).ctx.user?.id;
        const result = await (context as any).upsert({ where, create: { ...create, userCreatedId }, update: { ...update, userUpdatedId }, ...args });
        return result;
      }
    }
  }
  
});

export { prisma };