class BaseException extends Error {
    status;
    errors;
    constructor(status, message, name, errors) {
        super(message);
        this.status = status;
        this.name = name;
        this.errors = errors;
    }
}
export default BaseException;
