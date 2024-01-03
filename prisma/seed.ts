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
      // id: 1,
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

  // insere 3 usuarios de teste
  const senhaTeste = await hashSenha('lucas');
  const usuarioTeste = await prisma.usuarios.upsert({
    where: { email: 'lucas' },
    update: {},
    create: {
      // id: 2,
      nome: 'Lucas',
      email: 'lucas',
      senha: senhaTeste,
      permissaoAdmin: false,
      permissaoUsuarios: false,
      permissaoProjetos: false,
      permissaoPublicacoes: false,
      situacaoCadastroId: 1,
    },
  });

  const senhaTeste2 = await hashSenha('tiago');
  const usuarioTeste2 = await prisma.usuarios.upsert({
    where: { email: 'tiago' },
    update: {},
    create: {
      // id: 3,
      nome: 'Tiago',
      email: 'tiago',
      senha: senhaTeste2,
      permissaoAdmin: false,
      permissaoUsuarios: false,
      permissaoProjetos: false,
      permissaoPublicacoes: false,
      situacaoCadastroId: 1,
    },
  });

  const senhaTeste3 = await hashSenha('guilherme');
  const usuarioTeste3 = await prisma.usuarios.upsert({
    where: { email: 'guilherme' },
    update: {},
    create: {
      // id: 4,
      nome: 'Guilherme',
      email: 'guilherme',
      senha: senhaTeste3,
      permissaoAdmin: false,
      permissaoUsuarios: false,
      permissaoProjetos: false,
      permissaoPublicacoes: false,
      situacaoCadastroId: 1,
    },
  });

  const tipoVinculos = await prisma.tipoVinculos.createMany({
    data: [
      { nome: 'Aluno', situacaoCadastroId: 1, userCreatedId: 1, userUpdatedId: 1 },
      { nome: 'Professor', situacaoCadastroId: 1, userCreatedId: 1, userUpdatedId: 1 },
      { nome: 'Pesquisador', situacaoCadastroId: 1, userCreatedId: 1, userUpdatedId: 1 },
      { nome: 'Colaborador', situacaoCadastroId: 1, userCreatedId: 1, userUpdatedId: 1 },
      { nome: 'Outro', situacaoCadastroId: 1, userCreatedId: 1, userUpdatedId: 1 },
    ],
    skipDuplicates: true,
  });

  const tipoPapeis = await prisma.tipoPapeis.createMany({
    data: [
      { nome: 'Analista', situacaoCadastroId: 1, userCreatedId: 1, userUpdatedId: 1 },
      { nome: 'Front-End', situacaoCadastroId: 1, userCreatedId: 1, userUpdatedId: 1 },
      { nome: 'Back-End', situacaoCadastroId: 1, userCreatedId: 1, userUpdatedId: 1 },
      { nome: 'Outro', situacaoCadastroId: 1, userCreatedId: 1, userUpdatedId: 1 },
    ],
    skipDuplicates: true,
  });

  const tipoSituacoesProjetos = await prisma.tipoSituacoesProjetos.createMany({
    data: [
      { nome: 'Em andamento', situacaoCadastroId: 1, userCreatedId: 1, userUpdatedId: 1 },
      { nome: 'Concluído', situacaoCadastroId: 1, userCreatedId: 1, userUpdatedId: 1 },
      { nome: 'Cancelado', situacaoCadastroId: 1, userCreatedId: 1, userUpdatedId: 1 },
    ],
    skipDuplicates: true,
  });

  const tipoProjetos = await prisma.tipoProjetos.createMany({
    data: [
      { nome: 'Pesquisa', situacaoCadastroId: 1, userCreatedId: 1, userUpdatedId: 1 },
      { nome: 'Extensão', situacaoCadastroId: 1, userCreatedId: 1, userUpdatedId: 1 },
      { nome: 'Ensino', situacaoCadastroId: 1, userCreatedId: 1, userUpdatedId: 1 },
      { nome: 'Outro', situacaoCadastroId: 1, userCreatedId: 1, userUpdatedId: 1 },
    ],
    skipDuplicates: true,
  });

  const configuracaoSobreNos = await prisma.configuracaoSobreNos.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      descricao: 'Laboratório de Engenharia de Software',
      endereco: 'Cidade Universitária, Campo Grande - MS',
      coordenadorLaboratorioId: 1,
      emailCoordenador: 'facom@ufms.br',
      telefoneLaboratorio: '(67) 3333-3333',
      segundaLaboratorioAbre: true,
      horarioSegundaAbertura: '08:00',
      horarioSegundaFechamento: '18:00',
      tercaLaboratorioAbre: true,
      horarioTercaAbertura: '08:00',
      horarioTercaFechamento: '18:00',
      quartaLaboratorioAbre: true,
      horarioQuartaAbertura: '08:00',
      horarioQuartaFechamento: '18:00',
      quintaLaboratorioAbre: true,
      horarioQuintaAbertura: '08:00',
      horarioQuintaFechamento: '18:00',
      sextaLaboratorioAbre: true,
      horarioSextaAbertura: '08:00',
      horarioSextaFechamento: '18:00',
      sabadoLaboratorioAbre: false,
      horarioSabadoAbertura: '',
      horarioSabadoFechamento: '',
      domingoLaboratorioAbre: false,
      horarioDomingoAbertura: '',
      horarioDomingoFechamento: '',
      situacaoCadastroId: 1,
      userCreatedId: 1,
      userUpdatedId: 1,
    },
  });

  console.log({ situacaoCadastros, usuarioAdmin, usuarioTeste, usuarioTeste2, usuarioTeste3, tipoVinculos, tipoPapeis, tipoSituacoesProjetos, tipoProjetos });
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