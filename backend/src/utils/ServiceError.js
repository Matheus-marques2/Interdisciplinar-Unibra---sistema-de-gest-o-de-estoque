// Erro de negócio/validação — carrega um status HTTP para o errorMiddleware devolver ao cliente.
class ServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'ServiceError';
    this.status = status;
  }
}

module.exports = ServiceError;
