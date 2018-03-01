import { InjectionToken } from '@neoskop/injector'

export const BASE_PATHS = new InjectionToken<(string|RegExp)[]>('BasePaths');

export const MULTI_TOKENS_FROM_PARENT = [
    BASE_PATHS
];
