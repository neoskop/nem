import { IMiddleware } from '../../../../../src/interfaces/middleware';
import { Middleware } from '../../../../../src/metadata/middleware';
import { NextFunction, Request, Response } from 'express';

@Middleware()
export class BeforeMiddleware implements IMiddleware {
    
    use(request : Request, response : Response, next : NextFunction) : any {
        console.log('before');
        next();
    }
}
