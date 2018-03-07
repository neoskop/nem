import { Annotator, Type } from '../utils/annotations';
import { RequestHandler } from 'express';

export interface MiddlewareDecorator {
    () : any;
    
    new () : Middleware;
}

export interface Middleware {
}

export const Middleware : MiddlewareDecorator = Annotator.makeCtorDecorator('Middleware');

export interface IUseOptions {
    use? : 'before' | 'after'
}

export interface UseDecorator {
    (middleware : Type<any> | RequestHandler, options? : IUseOptions) : any;
    
    new (middleware : Type<any> | RequestHandler, options? : IUseOptions) : Use;
}

export interface Use {
    middleware : Type<any> | RequestHandler;
    use : 'before' | 'after'
}

export const Use : UseDecorator = Annotator.makePropDecorator('Use', (middleware : Type<any> | RequestHandler, options : IUseOptions = {}) => ({
    use: 'before',
    ...options,
    middleware
}));
