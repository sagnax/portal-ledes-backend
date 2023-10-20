/**
 * Tipo das Respostas da API
 */
type APIResponse = {
  status: number;
  message: string;
  data: any;
};

type APIError = {
  status: number;
  message: string;
  data?: any;
}