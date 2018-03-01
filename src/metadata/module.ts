import { Annotator, Type, TypeDecorator } from '../utils/annotations';
import { Provider } from '@neoskop/injector';
import { Router } from 'express';

export interface NemModuleDecorator {
    (obj? : NemModule) : TypeDecorator;
    new (obj?: NemModule) : NemModule;
}

export interface NemModule {
    basePath?: string;
    imports?: Type<any>[];
    providers?: Provider[];
    middlewares?: (any|any[])[];
    router?: [ string|RegExp, Router ][];
    controller?: [ string|RegExp, Type<any>][];
}

export const NemModule : NemModuleDecorator = Annotator.makeCtorDecorator('NemModule', (options : NemModule) => options);
