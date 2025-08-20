import BaseException from "./baseException.js";
export class NotFoundException extends BaseException {
    constructor(message, errors) {
        super(404, message || "DEF_404", "NAME_404", errors);
    }
}
export default NotFoundException;
