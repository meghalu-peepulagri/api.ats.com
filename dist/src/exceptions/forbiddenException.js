import { FORBIDDEN } from "../constants/httpStatusPharses.js";
import BaseException from "./baseException.js";
class ForbiddenException extends BaseException {
    constructor(message) {
        super(403, message || FORBIDDEN, FORBIDDEN, true);
    }
}
export default ForbiddenException;
