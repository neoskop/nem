import { NextFunction, Request, Response } from 'express';

export interface IMiddleware {
    use(request : Request, response : Response, next : NextFunction) : any;
}
