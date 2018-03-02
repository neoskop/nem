import 'source-map-support/register';
import { InjectorFactory, Provider, Injector } from '@neoskop/injector';
import { Type } from './utils/annotations';
import * as express from 'express';
import { ParamFactory } from './factories/param';
import { ModuleRouterFactory } from './factories/module-router';
import { NemRootZone } from './zone';
import { ERROR_HANDLER } from './tokens';
import { defaultErrorHandler } from './errors/error-handler';

export interface INemOptions {
    providers?: Provider[]
}

export function nem(options : INemOptions = {}) {
    return new NemBootstrap(options);
}

export const BOOTSTRAP_PROVIDER : Provider[] = [
    ParamFactory,
    ModuleRouterFactory,
    { provide: NemRootZone, useValue: Zone.root },
    { provide: ERROR_HANDLER, useValue: defaultErrorHandler }
];

export class NemBootstrap {
    protected injector : Injector = InjectorFactory.create({
        name: 'BootstrapInjector',
        providers: [
            ...BOOTSTRAP_PROVIDER,
            ...(this.options.providers || [])
        ]
    });
    
    constructor(protected options : INemOptions) {
    
    }
    
    bootstrap(module : Type<any>, app : express.Application = express()) : express.Application {
        const rootModuleRouter = this.injector.get(ModuleRouterFactory).createRouterFromModule(module);
        
        app.use(rootModuleRouter);
        
        const errorHandler = this.injector.get(ERROR_HANDLER);
        if(errorHandler) {
            app.use(errorHandler);
        }
        
        return app;
    }
}
