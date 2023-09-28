async function hashSenha(senha: string) {
  const senhaHash = await Bun.password.hash(senha);
  return senhaHash;
}

async function verificaSenha(senha: string, senhaHash: string) {
  const senhaCorreta = await Bun.password.verify(senha, senhaHash);
  return senhaCorreta;
}

async function hashEmail(email: string) {
  const hasher = new Bun.CryptoHasher("sha256");
  const emailHash = hasher.update(email).digest("hex");
  return emailHash;
}

export { hashSenha, verificaSenha, hashEmail };