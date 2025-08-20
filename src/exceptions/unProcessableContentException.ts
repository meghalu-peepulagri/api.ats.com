import BaseException from "./baseException.js";

class UnprocessableContentException extends BaseException {
  constructor(message?: string, errors?: any) {
    super(422, message || "DEF_422", "NAME_422", errors);
  }
}
export default UnprocessableContentException;
