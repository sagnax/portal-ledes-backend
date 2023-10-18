// Algoritmo usado para gerar o hash da senha
const SENHA_INICIO_HASH = "$argon2id$v=19$m=65536,t=2,p=1";

async function hashSenha(senha: string) {
  let senhaHash = await Bun.password.hash(senha);
  senhaHash = senhaHash.split(SENHA_INICIO_HASH)[1];
  return senhaHash;
}

async function verificaSenha(senha: string, senhaHash: string) {
  const senhaCorreta = await Bun.password.verify(senha, SENHA_INICIO_HASH + senhaHash);
  return senhaCorreta;
}

async function hashEmail(email: string) {
  const hasher = new Bun.CryptoHasher("sha256");
  const emailHash = hasher.update(email).digest("hex");
  return emailHash;
}

export { hashSenha, verificaSenha, hashEmail };