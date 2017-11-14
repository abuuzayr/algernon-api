export class DomainError extends Error {
  constructor (...args: any[]) {
    super(...args);
    Error.captureStackTrace(this, DomainError);
  }
}
