import * as HttpStatus from 'http-status';


/**
 * Generic http error
 */
export class HttpError implements Error {
    public message : string;
    public stack : string;
    public name : string;
    
    constructor(public code : number, message?: string|null, public error? : any) {
        this.message = message || (HttpStatus as any)[code];
        this.stack = new Error().stack!.replace(/^[^\r\n]+/, this.constructor.name)
                                       .replace(/\r?\n[^\r\n]+/, '');
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * Error class for http status 400
 */
export class BadRequestError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.BAD_REQUEST, message, error);
    }
}

/**
 * Error class for http status 401
 */
export class UnauthorizedError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.UNAUTHORIZED, message, error);
    }
}

/**
 * Error class for http status 403
 */
export class ForbiddenError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.FORBIDDEN, message, error);
    }
}

/**
 * Error class for http status 404
 */
export class NotFoundError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.NOT_FOUND, message, error);
    }
}

/**
 * Error class for http status 406
 */
export class NotAcceptableError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.NOT_ACCEPTABLE, message, error);
    }
}

/**
 * Error class for http status 412
 */
export class PreconditionFailedError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.PRECONDITION_FAILED, message, error);
    }
}

/**
 * Error class for http status 415
 */
export class UnsupportedMediaTypeError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.UNSUPPORTED_MEDIA_TYPE, message, error);
    }
}

/**
 * Error class for http status 500
 */
export class InternalServerError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, message, error);
    }
}

/**
 * Error class for http status 501
 */
export class NotImplementedError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.NOT_IMPLEMENTED, message, error)
    }
}
