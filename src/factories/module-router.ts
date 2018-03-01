import { Router } from 'express';
import { Annotator, Type } from '../utils/annotations';
import { NemModule } from '../metadata/module';
import { Injector, InjectorFactory, Provider, Injectable } from '@neoskop/injector';
import { ControllerRouterFactory } from './controller-router';

export const MODULE_FACTORY_PROVIDER : Provider[] = [
    ControllerRouterFactory
];

@Injectable()
export class ModuleRouterFactory {
    
    constructor(protected injector : Injector) {
    }
    
    createRouterFromModule(cls : Type<any>) : Router {
        const router = Router();
    
        const module = this.assertModuleAnnotation(cls);
        const injector = InjectorFactory.create({
            parent: this.injector,
            providers: [
                ...MODULE_FACTORY_PROVIDER,
                ...(module.providers || []),
                cls
            ]
        });
        const controllerFactory = injector.get(ControllerRouterFactory);
        
        if(module.imports) {
            for(const mod of module.imports) {
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
                this.handleRouter(path, controllerFactory.createRouterFromController(controller), router);
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
    
    protected handleImport(module : Type<any>, router : Router) {
        router.use(this.createRouterFromModule(module));
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
