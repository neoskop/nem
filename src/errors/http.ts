import * as HttpStatus from 'http-status';


export interface HttpError extends Error {}

export class HttpError {
    public message : string;
    public stack : string;
    
    constructor(public code : number, message?: string|null, public error? : any) {
        this.message = message || (HttpStatus as any)[code];
        this.stack = new Error().stack!.replace(/^[^\r\n]+/, this.constructor.name)
                                       .replace(/\r?\n[^\r\n]+/, '');
    }
}

export class BadRequestError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.BAD_REQUEST, message, error);
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.UNAUTHORIZED, message, error);
    }
}

export class ForbiddenError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.FORBIDDEN, message, error);
    }
}

export class NotFoundError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.NOT_FOUND, message, error);
    }
}

export class NotAcceptableError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.NOT_ACCEPTABLE, message, error);
    }
}

export class PreconditionFailedError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.PRECONDITION_FAILED, message, error);
    }
}

export class UnsupportedMediaTypeError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.UNSUPPORTED_MEDIA_TYPE, message, error);
    }
}

export class InternalServerError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, message, error)
    }
}

export class NotImplementedError extends HttpError {
    constructor(message?: string|null, error? : any) {
        super(HttpStatus.NOT_IMPLEMENTED, message, error)
    }
}
