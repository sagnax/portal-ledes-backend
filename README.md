# Criando o Ambiente para o Backend
## 1. Install Node Version Manager
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```

### Restart Terminal/Bash

## 2. Install NodeJS
```bash
nvm install node
```

## 3. Install unzip
```bash
sudo apt install unzip
```

## 4. Install Bun
```bash
curl -fsSL https://bun.sh/install | bash
```

### Restart Terminal/Bash

## 5. Install PostgreSQL
### 5.1 Create the file repository configuration:
```bash
sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
```

### 5.2 Import the repository signing key:
```bash
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
```

### 5.3 Update the package lists:
```bash
sudo apt-get update
```

### 5.4 Install the latest version of PostgreSQL.
### If you want a specific version, use 'postgresql-12' or similar instead of 'postgresql':
```bash
sudo apt-get -y install postgresql
```

---
---
## PostgreSQL
### 1. Logar como usuário postgres
```bash
sudo -i -u postgres
```

### 2. Criar um usuário superuser secundario
```bash
createuser --interactive
```

### 3. Abrir o PSQL
```bash
psql
```

### 4. Alterar a senha do Usuário criado
```sql
ALTER USER <nome-do-usuario> WITH PASSWORD '<senha>';

### 5. Criar o Banco de Dados
```sql
CREATE DATABASE <nome-do-banco>;
```

### 6. Dar permissão ao usuário
```sql
ALTER DATABASE <nome-do-banco> OWNER TO <nome-do-usuario>;
ou
GRANT ALL PRIVILEGES ON DATABASE <nome-do-banco> TO <nome-do-usuario>;
```

---
---

# Iniciando o Backend
## 1. Inicie o PostgreSQL
```bash
sudo /etc/init.d/postgresql <start|stop|status|restart>
ou
sudo service postgresql <start|stop|status|restart>

sudo systemctl enable postgresql
```

## 2. Inicie o Servidor/Bun
```bash
bun run dev
```