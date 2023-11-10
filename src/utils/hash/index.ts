/** Algoritmo e parametros usados para gerar o hash da senha */
const ALGORITMO_HASH = "$argon2id$v=19$m=65536,t=2,p=1";

/**
 * Faz o hash da senha usando o algoritmo argon2id.
 * 
 * @param senha senha a ser criptografada
 * @returns senha criptografada, sem o algoitmo e parâmetros usados
 */
async function hashSenha(senha: string) : Promise<string> {
  let senhaHash = await Bun.password.hash(senha);
  senhaHash = senhaHash.split(ALGORITMO_HASH)[1];
  return senhaHash;
}

/**
 * Faz a verificação se a senha dada é a mesma que a senha criptografada.
 * 
 * @param senha senha a ser verificada
 * @param senhaHash hash da senha a ser verificada
 * @returns true se a senha estiver correta, false se não estiver
 */
async function verificaSenha(senha: string, senhaHash: string) : Promise<boolean> {
  const senhaCorreta = await Bun.password.verify(senha, ALGORITMO_HASH + senhaHash);
  return senhaCorreta;
}

/**
 * Faz o hash do email usando o algoritmo sha256.
 * 
 * @param email email a ser criptografado
 * @returns email criptografado
 */
async function hashEmail(email: string) {
  const hasher = new Bun.CryptoHasher("sha256");
  const emailHash = hasher.update(email).digest("hex");
  return emailHash;
}

/**
 * Faz o hash do texto usando o algoritmo md5.
 * 
 * @param texto texto a ser criptografado
 * @returns texto criptografado
 */
async function hashTexto(texto: string) {
  const hasher = new Bun.CryptoHasher("md5");
  const textoHash = hasher.update(texto).digest("hex");
  return textoHash;
}

export { hashSenha, verificaSenha, hashEmail, hashTexto };