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
        const dataToModify = [...(args.data)]; //! arrumar aqui
        dataToModify.forEach((element:any, idx) => {
          element = {
            userCreatedId: authUser.id,
            ...element
          }
          dataToModify[idx] = element;
        }); 
        args.data = dataToModify;
        return await (context as any).updateMany(args);
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
// ! Criar a extensão de Created user id
// ! Criar a extensão de Updated user id
// ! Criar a extensão de Find situacao = 1
// // Filtra Excluidos Extension
// .$extends({
//   name: "FiltraExcluidos",
//   query: {
//     $allModels: {
//       async findUnique({ model, operation, args, query }) {
//         args.where = {
//           situacaoCadastroId: 1,
//           ...args.where
//         }
//         return query(args);
        
//       },
//       async findFirst({ model, operation, args, query }) {
//         args.where = {
//           situacaoCadastroId: 1,
//           ...args.where
//         }
//         return query(args);
//       },
//     }
//   }
// })
// // User Updated Id Extension
// .$extends({
//   name: "UserUpdatedId",
//   query: {
//     $allModels: {
//       async update({ model, operation, args, query }) {
//         args.data = {
//           userUpdatedId: 1,
//           ...args.data
//         }
//         args.where = {
//           situacaoCadastroId: 1,
//           ...args.where
//         }
//         return query(args);
//       },
//       async updateMany({ model, operation, args, query }) {
//         args.where = {
//           situacaoCadastroId: 1,
//           ...args.where
//         }
//         return query(args);
//       },
//     }
//   }
// })
// // User Created Id Extension
// .$extends({
//   name: "UserCreatedId",
//   query: {
//     $allModels: {
//       async create({ model, operation, args, query }) {
//         args.data = {
//           situacaoCadastroId: 1,
//           ...args.data
//         }
//         return query(args);
//       },
//       async createMany({ model, operation, args, query }) {
//         args.data = {
//           situacaoCadastroId: 1,
//           ...args.data
//         }
//         return query(args);
//       },
//     }
//   }
// })

export { prisma };