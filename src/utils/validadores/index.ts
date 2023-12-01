/** Regex usado para verificar se a senha atende os requisitos mínimos. */
const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@#$!%*?&]{10,}$/;

/**
 * Faz a validação da senha usando o regex.
 * 
 * @param password senha a ser verificada.
 * @returns true se a senha atende os requisitos mínimos, false se não atende.
 */
const validadorSenha = (password: string) : boolean => {
  return senhaRegex.test(password);
}

/** Regex usado para verificar se o email atende os requisitos mínimos. */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Faz a validação do email usando o regex.
 * 
 * @param email email a ser verificado.
 * @returns true se o email atende os requisitos mínimos, false se não atende.
 */
const validadorEmail = (email: string) : boolean => {
  return emailRegex.test(email);
}

export { validadorSenha, validadorEmail };