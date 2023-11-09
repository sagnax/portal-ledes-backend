# Trabalho de Construção de Software

## Portal LEDES

**Participantes:**
- **Professor**: Ricardo M. Kondo
- **Aluno**: [Lucas R. Marques](https://github.com/sagnax) (Back-End)
- **Aluno**: Tiago (Front-End)
- **Aluno**: Guilherme (Front-End)

### **Abstract:**

Este projeto de Construção de Software tem como objetivo o desenvolvimento de um portal para o Laboratório de Engenharia de Software da UFMS (LEDES). O escopo abrange desde a análise de requisitos até a implementação do Front-End e Back-End. O foco central reside no Back-End, concebido como uma API RESTful independente do Front-End.

O software resultante permitirá o gerenciamento eficaz de notícias e projetos do LEDES. Adotando tecnologias como Bun, Elysia, Prisma e PostgreSQL no Back-End, o sistema proporciona uma experiência eficiente e escalável. O uso do TypeScript como linguagem principal reforça a robustez do framework.

A ausência de um portal para o LEDES motivou este projeto, visando facilitar a comunicação entre professores, coordenadores e alunos da FACOM. Os usuários finais terão acesso a notícias relevantes, projetos em andamento e demais informações do LEDES.

Destaca-se a inovação na escolha de tecnologias de ponta, como Bun e ElysiaJS, conferindo maior desempenho e flexibilidade. A separação entre Front-End e Back-End garante independência e facilita futuras atualizações, minimizando impactos entre as camadas.

Desafios foram enfrentados na adoção de tecnologias emergentes, exigindo consulta frequente à documentação devido à disponibilidade limitada de recursos online. Contudo, esta abordagem representa uma oportunidade de aprendizado e contribui para a formação técnica da equipe.

Atualmente em andamento, espera-se que o projeto culmine em um portal totalmente funcional e acessível aos usuários, consolidando o LEDES como um centro de informações dinâmico e eficiente.

---

### Configurando o Ambiente para o Back-End (Linux - Ubuntu)

#### Instalando os pré-requisitos necessários.

>  [!NOTE]
>  Para instalar os programas, utilize o Terminal/Bash do Linux
>  Espera-se que você tenha o Git instalado para uso posterior

####  1. Instale o Node Version Manager (nvm).
Necessário para instalar versões do NodeJS
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh  | bash
```

>  [!IMPORTANT]
>  Reinicie o Terminal/Bash do Linux

####  2. Instale o NodeJS.
Com esse comando, será instalada a versão mais recente do NodeJS
```bash
nvm install node
```

####  3. Instale o pacote unzip.
Necessário para instalar o Bun
```bash
sudo apt install unzip
```

####  4. Instale o Bun.
Instalar a versão mais recente do Bun
```bash
curl -fsSL https://bun.sh/install | bash
```

>  [!IMPORTANT]
>  Reinicie o Terminal/Bash do Linux

####  5. Instale o PostgreSQL.
Instalar o PostgreSQL que usaremos como banco de dados
#####  5.1. Criar o arquivo de configuração de repositório:
```bash
sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
```

#####  5.2. Importar a chave do repositório:
```bash
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
```

#####  5.3. Atualizar a lista de pacotes:
```bash
sudo apt-get update
```

#####  5.4. Instale a versão mais recente do PostgreSQL.
>  [!NOTE]
>  Se quiser instalar alguma versão específica, utilize 'postgresql-12' ou similar ao invés de 'postgresql':
```bash
sudo apt-get -y install postgresql
```

---

####  Configurando o PostgreSQL

####  1. Logar como usuário postgres.
```bash
sudo -i -u postgres
```

####  2. Criar um usuário superuser secundário.
```bash
createuser --interactive
```

####  3. Abrir o PSQL.
```bash
psql
```

####  4. Alterar a senha do Usuário criado.
```sql
ALTER USER <nome-do-usuario> WITH PASSWORD '<senha>';
```

####  5. Criar o Banco de Dados.
```sql
CREATE DATABASE <nome-do-banco>;
```

####  6. Dar permissão ao usuário.
```sql
ALTER DATABASE <nome-do-banco> OWNER TO <nome-do-usuario>;
```
ou
```sql
GRANT ALL PRIVILEGES ON DATABASE <nome-do-banco> TO <nome-do-usuario>;
```

####  7. Sair do PSQL.
```sql
\q
```

####  8. Sair do usuário postgres.
```bash
exit
```

---

### Iniciando o Back-End

####  1. Inicie o PostgreSQL.
```bash
sudo /etc/init.d/postgresql <start|stop|status|restart>
```
ou
```bash
sudo service postgresql <start|stop|status|restart>
```
caso os 2 acima não funcionar, talvez este abaixo funcione.
```bash
sudo systemctl enable postgresql
```

####  2. Baixar o projeto.

#####  2.1. Clone o repositório.
```bash
git  clone  <link-do-repositorio>
```

#####  2.2. Entrar na pasta do projeto.
```bash
cd <nome-da-pasta>
```

#####  2.3. Instalar as dependências.
```bash
bun install
```

####  3. Configurar o projeto.

#####  3.1. Criar arquivo `.env` a partir do exemplo.
```bash
cp .env.example .env
```

#####  3.2. Ajustar as Variáveis de Ambiente do arquivo `.env`.
```bash
DATABASE_URL="<adapter>://<usuario>:<senha>@localhost:5432/<nome-banco>?schema=public"
JWT_SECRET="secret"
```

####  4. Sincronizar o Banco de Dados com o Schema do Prisma (Sincronizar sem Migration).
```bash
bunx prisma db push
```

#####  4.1. Rodar o Seed no Banco.
```bash
bunx prisma db seed
```

#####  4.2. Se precisar visualizar o banco pode usar o Prisma Studio.
```bash
bunx prisma studio
```

####  5. Inicie o Servidor/Bun
```bash
bun run dev
```