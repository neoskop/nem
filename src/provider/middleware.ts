import { RequestHandler } from 'express';
import { Annotator, Type } from '../utils/annotations';
import { MIDDLEWARE_AFTER, MIDDLEWARE_BEFORE } from '../tokens';
import { Middleware } from '../metadata/middleware';
import { Provider } from '@neoskop/injector';

export function middleware(middleware : Type<any>|RequestHandler, placement : 'before'|'after' = 'before') : Provider {
    const provide = placement === 'before' ? MIDDLEWARE_BEFORE : MIDDLEWARE_AFTER;
    
    if(Annotator.getCtorAnnotations(middleware as any).some(a => a instanceof Middleware)) {
        return { provide, useClass: middleware, multi : true }
    }
    return { provide, useValue: middleware, multi : true }
}
