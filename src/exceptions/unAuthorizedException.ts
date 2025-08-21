import { UNAUTHORIZED } from "../constants/httpStatusPharses.js";
import BaseException from "./baseException.js";

class UnauthorizedException extends BaseException {
  constructor(message: string) {
    super(401, message || UNAUTHORIZED, UNAUTHORIZED, true);
  }
}

export default UnauthorizedException;
