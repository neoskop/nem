import 'source-map-support/register';
import { InjectorFactory, Provider, Injector } from '@neoskop/injector';
import { Type } from './utils/annotations';
import * as express from 'express';
import { ParamFactory } from './factories/param';
import { ModuleRouterFactory } from './factories/module-router';
import { NemRootZone } from './zone';
import { ERROR_HANDLER, VIEW_ENGINE, VIEWS } from './tokens';
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
    { provide: ERROR_HANDLER, useValue: defaultErrorHandler },
    { provide: VIEW_ENGINE, useValue: 'ejs' }
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
        const factory = this.injector.get(ModuleRouterFactory);
        const injector = InjectorFactory.create({
            name: 'RootInjector',
            providers: factory.getRootProvider(module),
            parent: this.injector
        });
        const rootModuleRouter = factory.createRouterFromModule(module);
        
        const views = injector.get(VIEWS, null);
        if(views) {
            app.set('views', views);
        }
        app.set('view engine', injector.get(VIEW_ENGINE));
        
        app.use(rootModuleRouter);
        
        const errorHandler = injector.get(ERROR_HANDLER);
        if(errorHandler) {
            app.use(errorHandler);
        }
        
        return app;
    }
}
