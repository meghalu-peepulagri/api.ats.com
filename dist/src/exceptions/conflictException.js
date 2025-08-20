import BaseException from "./baseException.js";
export class ConflictException extends BaseException {
    constructor(message) {
        super(409, message || "DEF_409", "NAME_409");
    }
}
export default ConflictException;
