import { Annotator, Type } from '@neoskop/annotation-factory';
import { RequestHandler } from 'express';

/**
 * Type of Middleware decorator
 */
export interface MiddlewareDecorator {
    /**
     * Defines a class as middleware and should implement {@link IMiddleware}
     * @example
     * ```
     *
     * @Middleware()
     * export class TestMiddleware implements IMiddleware {
     *   use(request : Request, response : Response, next : NextFunction) : any {
     *     console.log('Test middleware...');
     *     next();
     *   }
     * }
     * ```
     */
    () : any;
    new () : Middleware;
}

/**
 * Type of Middleware metadata
 * @see {@link MiddlewareDecorator}
 */
export interface Middleware {
}

export const Middleware : MiddlewareDecorator = Annotator.makeCtorDecorator('Middleware');

export interface IUseOptions {
    use? : 'before' | 'after'
}

/**
 * Type of Use decorator
 */
export interface UseDecorator {
    /**
     * Defines a middleware to use for controller handler
     * @example
     * ```
     *
     * @Controller()
     * export class TestController {
     *   @Get('/')
     *   @Use(TestMiddleware)
     *   index() {
     *   }
     * }
     * ```
     */
    (middleware : Type<any> | RequestHandler, options? : IUseOptions) : any;
    new (middleware : Type<any> | RequestHandler, options? : IUseOptions) : Use;
}

/**
 * Type of Use metadata
 * @see {@link UseDecorator}
 */
export interface Use {
    middleware : Type<any> | RequestHandler;
    use : 'before' | 'after'
}

export const Use : UseDecorator = Annotator.makePropDecorator('Use', (middleware : Type<any> | RequestHandler, options : IUseOptions = {}) => ({
    use: 'before',
    ...options,
    middleware
}));
