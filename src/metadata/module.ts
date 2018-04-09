import { Annotator, Type, TypeDecorator } from '../utils/annotations';
import { Provider } from '@neoskop/injector';
import { Router } from 'express';

/**
 * Type of NemModule decorator
 */
export interface NemModuleDecorator {
    (obj? : NemModule) : TypeDecorator;
    new (obj?: NemModule) : NemModule;
}

/**
 * Type of NemModule metadata
 * @see {@link NemModuleDecorator}
 */
export interface NemModule {
    modules?: ([ string|RegExp, Type<any> | NemModuleWithProviders ] | Type<any> | NemModuleWithProviders)[];
    providers?: Provider[];
    middlewares?: (any|any[])[];
    router?: [ string|RegExp, Router ][];
    controller?: [ string|RegExp, Type<any>][];
}

export const NemModule : NemModuleDecorator = Annotator.makeCtorDecorator('NemModule', (options : NemModule) => options);

/**
 * Type of module factory return value
 * @example
 * ```
 *
 * @NemModule()
 * export class TestModule {
 *   static forValue(value : any) {
 *     return {
 *       nemModule: TestModule,
 *       providers: [
 *         { provide: 'VALUE', useValue: value }
 *       ]
 *     }
 *   }
 * }
 * ```
 */
export interface NemModuleWithProviders {
    nemModule: Type<any>;
    providers?: Provider[];
}
