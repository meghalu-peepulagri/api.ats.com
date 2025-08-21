import { UNPROCESSABLE_ENTITY } from "../constants/httpStatusCodes.js";
import { UNPROCESSABLE_ENTITY as UNPROCESSABLE_ENTITY_MESSAGE } from "../constants/httpStatusPharses.js";
import BaseException from "./baseException.js";

export default class UnprocessableEntityException extends BaseException {
  constructor(message?: string, errData?: any) {
    super(UNPROCESSABLE_ENTITY, message || UNPROCESSABLE_ENTITY_MESSAGE, UNPROCESSABLE_ENTITY_MESSAGE, errData);
  }
}
