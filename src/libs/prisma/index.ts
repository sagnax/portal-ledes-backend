import { Prisma, PrismaClient, Usuarios } from "@prisma/client";

const prisma = new PrismaClient()
// Create Extension
.$extends({
  name: "Create-WithAuthenticatedUser",
  model: {
    $allModels: {
      /** createWithAuthUser -> create */
      async createWithAuthUser<T> (this: T, args: Prisma.Args<T, "create">["create"], authUser: Usuarios) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        args.data = {
          userCreatedId: authUser.id,
          ...args.data
        }
        return await (context as any).create(args);
      },
      /** createManyWithAuthUser -> createMany */
      async createManyWithAuthUser<T> (this: T, args: Prisma.Args<T, "createMany">["createMany"], authUser: Usuarios) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        const dataToModify = [...args.data];

        dataToModify.forEach((element:any, idx) => {
          element = {
            userCreatedId: authUser.id,
            ...element
          }
          dataToModify[idx] = element;
        }); 
        args.data = dataToModify;
        return await (context as any).createMany(args);
      },
    }
  }
})
// Update Extension
.$extends({
  name: "Update-WithAuthenticatedUser",
  model: {
    $allModels: {
      /** updateWithAuthUser -> update */
      async updateWithAuthUser<T> (this: T, args: Prisma.Args<T, "update">["update"], authUser: Usuarios) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        args.data = {
          userUpdatedId: authUser.id,
          ...args.data
        }
        return await (context as any).update(args);
      },
      /** updateManyWithAuthUser -> updateMany */
      async updateManyWithAuthUser<T> (this: T, args: Prisma.Args<T, "updateMany">["updateMany"], authUser: Usuarios) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        args.data = {
          userUpdatedId: authUser.id,
          ...args.data
        }
        return await (context as any).updateMany(args);
      },
    }
  }
})
// Find Extension
.$extends({
  name: "Find-FilteredBySituacaoCadastro",
  model: {
    $allModels: {
      /** findFirstAtivo -> findFirst */
      async findFirstAtivo<T> (this: T, args: Prisma.Args<T, "findFirst">["findFirst"]) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        args.where = {
          situacaoCadastroId: 1,
          ...args.where
        }
        return await (context as any).findFirst(args);
      },
      /** findUniqueAtivo -> findUnique */
      async findUniqueAtivo<T> (this: T, args: Prisma.Args<T, "findUnique">["findUnique"]) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        args.where = {
          situacaoCadastroId: 1,
          ...args.where
        }
        return await (context as any).findUnique(args);
      },
      /** findManyAtivo -> findMany */
      async findManyAtivo<T> (this: T, args: Prisma.Args<T, "findMany">["findMany"]) : Promise<T[]> {
        const context = Prisma.getExtensionContext(this);
        args.where = {
          situacaoCadastroId: 1,
          ...args.where
        }
        args.orderBy = {
          id: 'asc',
          ...args.orderBy
        }
        return await (context as any).findMany(args);
      },
    }
  }
})
// Soft Delete Extension
.$extends({
  name: "SoftDelete",
  model: {
    $allModels: {
      async delete<T> (this: T, args: Prisma.Args<T, "delete">["delete"]) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        const data = {
          situacaoCadastroId: 2,
          situacaoCadastro: {
            connect: {
              id: 2
            }
          }
        }
        const where = {
          ...args.where
        }
        return await (context as any).update({data, where});
      },
      async deleteMany<T> (this: T, args: Prisma.Args<T, "deleteMany">["deleteMany"]) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        const data = {
          situacaoCadastroId: 2,
          situacaoCadastro: {
            connect: {
              id: 2
            }
          }
        }
        const where = {
          ...args.where
        }
        return await (context as any).updateMany({data, where});
      },
    }
  }
})

export { prisma };