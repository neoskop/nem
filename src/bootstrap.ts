import 'source-map-support/register';
import { InjectorFactory, Provider, Injector, Optional } from '@neoskop/injector';
import { Type } from './utils/annotations';
import * as express from 'express';
import { ParamFactory } from './factories/param';
import { IModuleContext, ModuleRouterFactory } from './factories/module-router';
import { NemRootZone } from './zone';
import {
    APP, BOOTSTRAP_LISTENER_AFTER, BOOTSTRAP_LISTENER_BEFORE, ERROR_HANDLER, MULTI_TOKENS_FROM_PARENT, SERVER,
    VIEW_ENGINE,
    VIEWS
} from './tokens';
import { defaultErrorHandler } from './errors/error-handler';
import { copyMultiProvider } from './utils/misc';
import { Application, ErrorRequestHandler } from 'express';
import { Server, createServer } from 'http';
import { ControllerRouterFactory } from './factories/controller-router';

/**
 * Bootstraping options
 */
export interface INemOptions {
    /**
     * Providers for bootstrapping
     */
    providers?: Provider[];
    
    /**
     * Injector to create the bootstrap injector from
     */
    injector?: Injector;
}

/**
 * Bootstrap factory
 */
export function nem(options : INemOptions = {}) : NemBootstrap {
    return new NemBootstrap(options);
}

/**
 * Required providers for bootstrapping
 *
 * @internal
 * @hidden
 */
const BOOTSTRAP_PROVIDER : Provider[] = [
    { provide: NemRootZone, useValue: Zone.root },
    { provide: ERROR_HANDLER, useValue: defaultErrorHandler },
    { provide: VIEW_ENGINE, useValue: 'ejs' }
];

/**
 * Required providers for root injector
 *
 * @internal
 * @hidden
 */
export const ROOT_PROVIDER : Provider[] = [
    {
        provide: BOOTSTRAP_LISTENER_BEFORE,
        useFactory(app : Application, views : string[], engine : string) {
            return () => {
                if(views) {
                    app.set('views', views);
                }
                app.set('view engine', engine);
            }
        },
        deps: [ APP, [ new Optional(), VIEWS ], VIEW_ENGINE ],
        multi: true
    },
    {
        provide: BOOTSTRAP_LISTENER_AFTER,
        useFactory(app : Application, errorHandler : ErrorRequestHandler) {
            return () => {
                app.use(errorHandler);
            }
        },
        deps: [ APP, ERROR_HANDLER ],
        multi: true
    },
    ParamFactory,
    ModuleRouterFactory,
    ControllerRouterFactory
];

export class NemBootstrap {
    protected injector : Injector = InjectorFactory.create({
        name: 'BootstrapInjector',
        providers: [
            ...BOOTSTRAP_PROVIDER,
            ...(this.options.providers || [])
        ],
        parent: this.options.injector
    });
    
    constructor(protected options : INemOptions) {
    
    }
    
    bootstrap(module : Type<any>, { app = express(), server = createServer(app) } : { app?: express.Application, server?: Server } = {}) : NemBootstrappedModule {
        const injector = InjectorFactory.create({
            name: 'RootInjector',
            providers: [
                ...ROOT_PROVIDER,
                copyMultiProvider(MULTI_TOKENS_FROM_PARENT, this.injector),
                { provide: APP, useValue: app },
                { provide: SERVER, useValue: server },
                ...ModuleRouterFactory.getProviders(module)
            ],
            parent: this.injector
        });
        const factory = injector.get(ModuleRouterFactory);
        
        const bootstrapListenerBefore = injector.get(BOOTSTRAP_LISTENER_BEFORE, []);
        for(const listener of bootstrapListenerBefore) {
            listener();
        }
    
        const context = factory.createRouterFromModule(module, { router: app });
        
        const bootstrapListenerAfter = injector.get(BOOTSTRAP_LISTENER_AFTER, []);
        for(const listener of bootstrapListenerAfter) {
            listener();
        }
        
        return new NemBootstrappedModule(injector, context);
    }
}

/**
 * The public api for the bootstrapped root module
 */
export class NemBootstrappedModule {
    /**
     * The root injector
     */
    readonly injector : Injector;
    
    /**
     * The root module context
     */
    readonly context : Readonly<IModuleContext>;
    
    constructor(injector : Injector, context : Readonly<IModuleContext>) {
        this.injector = injector;
        this.context = context;
    }
    
    listen(port : number, host?: string) : Promise<void> {
        return new Promise((resolve, reject) => {
            this.injector.get(SERVER).listen(port, host, (err : any) => {
                if(err) {
                    return reject(err);
                }
                resolve();
            })
        })
    }
}
