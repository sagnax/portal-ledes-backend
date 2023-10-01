import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()
// Soft Delete Extension
.$extends({
  name: "SoftDelete",
  model: {
    $allModels: {
      async delete<T> (this: T, {where}: Prisma.Args<T, 'update'>['where']) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        const data = {
          situacaoCadastroId: 2
        }
        return await (context as any).update({data, where});
      },
      async deleteMany<T> (this: T, args: Prisma.Args<T, 'updateMany'>) : Promise<T> {
        const context = Prisma.getExtensionContext(this);
        const data = {
          situacaoCadastroId: 2
        }
        const where = {
          ...args.where
        }
        return await (context as any).updateMany({data, where});
      },
    }
  }
})
// Soft Delete Extension
.$extends({
  name: "SoftDelete",
  query: {
    $allModels: {
      async findUnique({ model, operation, args, query }) {
        args.where = {
          ...args.where,
          situacaoCadastroId: 1
        }
        // change this function to a findFirst and pass the args
        return query(args);
        
      },
      async findFirst({ model, operation, args, query }) {
        console.log('aaaaaaaa')
        args.where = {
          ...args.where,
          situacaoCadastroId: 1
        }
        return query(args);
      },
    }
  }
})

export { prisma };