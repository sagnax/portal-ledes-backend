/** Custom API Response Error */
export class APIResponseError extends Error {
  errorData: APIResponse;
  constructor(errorData: APIResponse) {
    super(errorData.message);
    this.errorData = errorData;
    this.name = 'APIResponseError';
    throw this;
  }
}