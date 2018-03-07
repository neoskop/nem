import { Annotator, Type, TypeDecorator } from '../utils/annotations';
import { Provider } from '@neoskop/injector';
import { Router } from 'express';

export interface NemModuleDecorator {
    (obj? : NemModule) : TypeDecorator;
    new (obj?: NemModule) : NemModule;
}

export interface NemModule {
    modules?: ([ string|RegExp, Type<any> | NemModuleWithProviders ] | Type<any> | NemModuleWithProviders)[];
    providers?: Provider[];
    rootProviders?: Provider[];
    middlewares?: (any|any[])[];
    router?: [ string|RegExp, Router ][];
    controller?: [ string|RegExp, Type<any>][];
}

export const NemModule : NemModuleDecorator = Annotator.makeCtorDecorator('NemModule', (options : NemModule) => options);

export interface NemModuleWithProviders {
    nemModule: Type<any>;
    providers?: Provider[];
    rootProviders?: Provider[];
}
