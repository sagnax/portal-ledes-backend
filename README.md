# Configurando o Ambiente para o Backend (Linux - Ubuntu)
## Instalando os programas necessários
> [!NOTE]
> Para instalar os programas, utilize o Terminal/Bash do Linux
> Espera-se que você tenha o Git instalado para uso posterior
### 1. Instale o Node Version Manager (nvm)
Necessário para instalar versões do NodeJS
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```

> [!IMPORTANT]
> Reinicie o Terminal/Bash do Linux

### 2. Instale o NodeJS
Com esse comando, será instalada a versão mais recente do NodeJS
```bash
nvm install node
```

### 3. Instale o pacote unzip
Necessário para instalar o Bun
```bash
sudo apt install unzip
```

### 4. Instale o Bun
Instalar a versão mais recente do Bun
```bash
curl -fsSL https://bun.sh/install | bash
```

> [!IMPORTANT]
> Reinicie o Terminal/Bash do Linux

### 5. Instale o PostgreSQL
Instalar o PostgreSQL que usaremos como banco de dados
#### 5.1. Criar o arquivo de configuração de repositório:
```bash
sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
```

#### 5.2. Importar a chave do repositório:
```bash
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
```

#### 5.3. Atualizar a lista de pacotes:
```bash
sudo apt-get update
```

#### 5.4. Instale a versão mais recente do PostgreSQL.
> [!NOTE]
> Se quiser instalar alguma versão específica, utilize 'postgresql-12'  ou similar ao invés de 'postgresql':
```bash
sudo apt-get -y install postgresql
```


---
### Configurando o PostgreSQL
#### 1. Logar como usuário postgres
```bash
sudo -i -u postgres
```

#### 2. Criar um usuário superuser secundario
```bash
createuser --interactive
```

#### 3. Abrir o PSQL
```bash
psql
```

#### 4. Alterar a senha do Usuário criado
```sql
ALTER USER <nome-do-usuario> WITH PASSWORD '<senha>';
```

#### 5. Criar o Banco de Dados
```sql
CREATE DATABASE <nome-do-banco>;
```

#### 6. Dar permissão ao usuário
```sql
ALTER DATABASE <nome-do-banco> OWNER TO <nome-do-usuario>;
```
ou
```sql
GRANT ALL PRIVILEGES ON DATABASE <nome-do-banco> TO <nome-do-usuario>;
```

#### 7. Sair do PSQL
```sql
\q
```

#### 8. Sair do usuário postgres
```bash
exit
```

---

## Iniciando o Backend
### 1. Inicie o PostgreSQL
```bash
sudo /etc/init.d/postgresql <start|stop|status|restart>
ou
sudo service postgresql <start|stop|status|restart>
```
```bash
sudo systemctl enable postgresql
```

### 2. Baixar o projeto
#### 1. Clone o repositório
```bash
git clone <link-do-repositorio>
```

#### 2. Entrar no pasta do projeto
```bash
cd <nome-da-pasta>
```

#### 3. Instalar as dependências
```bash
bun install
```

### 3. Configurar o projeto
#### 3.1. Criar arquivo .env
```bash
cp .env.example .env
```
#### 3.2. Editar arquivo .env
```bash
DATABASE_URL="<adapter>://<usuario>:<senha>@localhost:5432/<nome-banco>?schema=public"
```

### 4. Sincronizar o Banco de Dados com o Schema do Prisma (Sincronizar)
```bash
bunx prisma db push
```

#### 4.1. Sincronizar o Banco de Dados com o Schema do Prisma (Gerar Migration)
```bash
bunx prisma db push
```

### 5. Inicie o Servidor/Bun
```bash
bun run dev
```