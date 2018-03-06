import { InjectionToken } from '@neoskop/injector'
import { ErrorRequestHandler } from 'express';
import { ApplicableAnnotation } from './metadata/controller';

export const BASE_PATHS = new InjectionToken<(string|RegExp)[]>('BasePaths');
export const ERROR_HANDLER = new InjectionToken<ErrorRequestHandler>('ErrorHandler');
export const VIEWS = new InjectionToken<string|string[]>('Views');
export const VIEW_ENGINE = new InjectionToken<string>('View Engine');
export const DEFAULT_END_HANDLER = new InjectionToken<ApplicableAnnotation>('Default End Handler');
export const VIEW_PREFIX = new InjectionToken<string|undefined>('View Prefix');

export const MULTI_TOKENS_FROM_PARENT = [
    BASE_PATHS
];
