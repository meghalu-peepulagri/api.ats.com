import BaseException from "./baseException.js";
class BadRequestException extends BaseException {
    constructor(message) {
        super(400, message ?? "BAD_REQUEST", "BAD_REQUEST", true);
    }
}
export default BadRequestException;
