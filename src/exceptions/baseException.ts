import type { StatusCode } from "hono/utils/http-status";

class BaseException extends Error {
  status: number;
  errors: any;

  constructor(status: StatusCode, message: string, name: string, errors?: any) {
    super(message);
    this.status = status;
    this.name = name;
    this.errors = errors;
  }
}

export default BaseException;
