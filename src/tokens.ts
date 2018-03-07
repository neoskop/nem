import { InjectionToken } from '@neoskop/injector'
import { ErrorRequestHandler, RequestHandler } from 'express';
import { ApplicableAnnotation } from './metadata/controller';
import { IMiddleware } from './interfaces/middleware';

export const BASE_PATHS = new InjectionToken<(string|RegExp)[]>('BasePaths');
export const ERROR_HANDLER = new InjectionToken<ErrorRequestHandler>('ErrorHandler');
export const VIEWS = new InjectionToken<string|string[]>('Views');
export const VIEW_ENGINE = new InjectionToken<string>('View Engine');
export const DEFAULT_END_HANDLER = new InjectionToken<ApplicableAnnotation>('Default End Handler');
export const VIEW_PREFIX = new InjectionToken<string|undefined>('View Prefix');
export const MIDDLEWARE_BEFORE = new InjectionToken<(IMiddleware|RequestHandler)[]>('Middleware Before');
export const MIDDLEWARE_AFTER = new InjectionToken<(IMiddleware|RequestHandler)[]>('Middleware After');

export const MULTI_TOKENS_FROM_PARENT = [
    BASE_PATHS
];
