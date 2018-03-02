import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { HttpError, InternalServerError } from './http';

export const defaultErrorHandler : ErrorRequestHandler = async function defaultErrorHandler(error : any, _request : Request, response : Response, _next : NextFunction) {
    if(!(error instanceof HttpError)) {
        error = new InternalServerError(undefined, error);
    }
    
    response.status(error.code);
    
    if(error.error && process.env.NODE_ENV !== 'production') {
        response.end(`${error.message}

${error.error.stack || error.error}`);
    } else {
        response.end(error.message);
    }
}
