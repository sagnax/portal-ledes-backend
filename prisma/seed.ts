import { hashSenha } from '~utils/hash';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Insere os SituacaoCadastros iniciais
  const situacaoCadastros = await prisma.situacaoCadastros.createMany({
    data: [
      { id: 1, nome: 'Ativo' },
      { id: 2, nome: 'Excluido' },
    ],
    skipDuplicates: true,
  });

  // Insere o usuário admin
  const senhaAdmin = await hashSenha('admin');
  const usuarioAdmin = await prisma.usuarios.upsert({
    where: { email: 'admin' },
    update: {},
    create: {
      id: 1,
      nome: 'Admin',
      email: 'admin',
      senha: senhaAdmin,
      permissaoAdmin: true,
      permissaoUsuarios: true,
      permissaoProjetos: true,
      permissaoPublicacoes: true,
      situacaoCadastroId: 1,
    },
  });

  console.log({ situacaoCadastros, usuarioAdmin });
}

await main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });