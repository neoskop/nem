import { InjectionToken } from '@neoskop/injector'
import { Application, ErrorRequestHandler, RequestHandler } from 'express';
import { ApplicableAnnotation } from './metadata/controller';
import { IMiddleware } from './interfaces/middleware';
import { Server } from 'http';

/**
 * Provides the default error handler
 * @see {@link defaultErrorHandler}
 */
export const ERROR_HANDLER = new InjectionToken<ErrorRequestHandler>('ErrorHandler');

/**
 * Provides an array of view directories
 */
export const VIEWS = new InjectionToken<string[]>('Views');

/**
 * Provides the name of the default view engine
 */
export const VIEW_ENGINE = new InjectionToken<string>('View Engine');

/**
 * Provides a end handler for the current request
 *
 * @internal
 * @hidden
 * @see {@link ApplicableAnnotation}
 */
export const DEFAULT_END_HANDLER = new InjectionToken<ApplicableAnnotation>('Default End Handler');

/**
 * Provides a path prefix for the views in the current module/controller
 */
export const VIEW_PREFIX = new InjectionToken<string|undefined>('View Prefix');

/**
 * Provides the middleware to invoke before to controller action handler
 */
export const MIDDLEWARE_BEFORE = new InjectionToken<(IMiddleware|RequestHandler)[]>('Middleware Before');

/**
 * Provides the middleware to invoke after to controller action handler
 */
export const MIDDLEWARE_AFTER = new InjectionToken<(IMiddleware|RequestHandler)[]>('Middleware After');

/**
 * Provides the express Application
 */
export const APP = new InjectionToken<Application>('Express Application');

/**
 * Provides the http server
 */
export const SERVER = new InjectionToken<Server>('Http Server');

/**
 * Provides an array of functions to call before the root module is created
 */
export const BOOTSTRAP_LISTENER_BEFORE = new InjectionToken<Function[]>('Bootstrap Listener Before');

/**
 * Provides an array of functions to call after the root module is created
 */
export const BOOTSTRAP_LISTENER_AFTER = new InjectionToken<Function[]>('Bootstrap Listener After');

/**
 * Defines the injection tokens to copy to child provider
 * Useful for multi providers
 *
 * @internal
 * @hidden
 */
export const MULTI_TOKENS_FROM_PARENT = [
    VIEWS,
    BOOTSTRAP_LISTENER_BEFORE,
    BOOTSTRAP_LISTENER_AFTER
];
