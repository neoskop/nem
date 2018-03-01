import { Router } from 'express';
import { Annotator, Type } from '../utils/annotations';
import { NemModule } from '../metadata/module';
import { Injector, InjectorFactory, Provider, Injectable } from '@neoskop/injector';
import { ControllerRouterFactory } from './controller-router';
import { BASE_PATHS, MULTI_TOKENS_FROM_PARENT } from '../tokens';
import { copyMultiProvider } from '../utils/misc';
const debug = require('debug')('nem:factory:module');

export const MODULE_FACTORY_PROVIDER : Provider[] = [
    ControllerRouterFactory
];

@Injectable()
export class ModuleRouterFactory {
    
    constructor(protected injector : Injector) {
    }
    
    createRouterFromModule(cls : Type<any>, { providers = [] } : { providers?: Provider[] } = {}) : Router {
        debug('create router from module', cls.name);
        const router = Router();
    
        const module = this.assertModuleAnnotation(cls);
        const injector = InjectorFactory.create({
            parent: this.injector,
            providers: [
                ...copyMultiProvider(MULTI_TOKENS_FROM_PARENT, this.injector),
                ...MODULE_FACTORY_PROVIDER,
                ...providers,
                ...(module.providers || []),
                cls
            ]
        });
        const controllerFactory = injector.get(ControllerRouterFactory);
        
        if(module.modules) {
            for(const mod of module.modules) {
                this.handleImport(mod, router);
            }
        }
        
        if(module.middlewares) {
            for(const middleware of module.middlewares) {
                this.handleMiddleware(middleware, router);
            }
        }
        
        if(module.router) {
            for(const [ path, subRouter ] of module.router) {
                this.handleRouter(path, subRouter, router);
            }
        }
        
        if(module.controller) {
            for(const [ path, controller ] of module.controller) {
                this.handleRouter(path, controllerFactory.createRouterFromController(controller, {
                    providers: [
                        { provide: BASE_PATHS, useValue: path, multi: true }
                    ]
                }), router);
            }
        }
        injector.get(cls);
    
        return router;
    }
    
    protected assertModuleAnnotation(cls : Type<any>) : NemModule {
        const annotations = Annotator.getCtorAnnotations(cls);
        
        for(const annotation of annotations) {
            if(annotation instanceof NemModule) {
                return annotation;
            }
        }
        
        throw new Error(`Class "${cls.name}" has no module annotation`);
    }
    
    protected handleImport(module : [ string|RegExp, Type<any> ]|Type<any>, router : Router) {
        if(Array.isArray(module)) {
            const [ path, mod ] = module;
            debug('handle import', path, mod.name);
            router.use(path, this.createRouterFromModule(mod, {
                providers: [
                    { provide: BASE_PATHS, useValue: path, multi: true }
                ]
            }));
        } else {
            debug('handle import', module.name);
            router.use(this.createRouterFromModule(module));
        }
    }
    
    protected handleMiddleware(middleware : any|any[], router : Router) {
        if(Array.isArray(middleware)) {
            router.use(...middleware);
        } else {
            router.use(middleware);
        }
    }
    
    protected handleRouter(route : string|RegExp, subRouter : Router, router : Router) {
        router.use(route, subRouter);
    }
}
