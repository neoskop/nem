import { IRouter, Router } from 'express';
import { Annotator, Type } from '@neoskop/annotation-factory';
import { NemModule, NemModuleWithProviders } from '../metadata/module';
import { Injectable, Injector, Provider } from '@neoskop/injector';
import { ControllerRouterFactory } from './controller-router';

/** @hidden */
const debug = require('debug')('nem:factory:module');


export interface IModuleContext<T = any> {
    /**
     * The module type class
     */
    moduleType : Type<T>;
    
    /**
     * The module metadata
     */
    metadata : NemModule;
    
    /**
     * The controller factory
     */
    factory: ControllerRouterFactory;
    
    /**
     * The use router
     */
    router : IRouter<any>;
    
    /**
     * The module instance
     */
    module? : T;
}

@Injectable()
export class ModuleRouterFactory {
    
    constructor(protected injector : Injector) {
    }
    
    static getProviders(moduleType : Type<any>) : Provider[] {
        const metadata = this.assertModuleAnnotation(moduleType);
        
        return [
            moduleType,
            ...(metadata.providers || []),
            ...(metadata.modules || []).map(declaration => {
                const nemModule = this.assertNemModuleWithProviders(Array.isArray(declaration) ? declaration[1] : declaration);
                return [
                    this.getProviders(nemModule.nemModule),
                    ...(nemModule.providers || [])
                ]
            }).reduce((t, c) => t.concat(c), [])
        ]
    }
    
    createRouterFromModule(moduleType : Type<any>, options : { router?: IRouter<any> } = {}) : IModuleContext {
        debug('create router from module', moduleType.name);
        
        const ctx = this.initContext(moduleType, options);
        
        if(ctx.metadata.modules) {
            for(const mod of ctx.metadata.modules) {
                this.handleImport(mod, ctx.router);
            }
        }
        
        if(ctx.metadata.middlewares) {
            for(const middleware of ctx.metadata.middlewares) {
                this.handleMiddleware(middleware, ctx.router);
            }
        }
        
        if(ctx.metadata.router) {
            for(const [ path, subRouter ] of ctx.metadata.router) {
                this.handleRouter(path, subRouter, ctx.router);
            }
        }
        
        if(ctx.metadata.controller) {
            for(const [ path, controller ] of ctx.metadata.controller) {
                this.handleRouter(path, ctx.factory.createRouterFromController(controller), ctx.router);
            }
        }
        ctx.module = this.injector.get(moduleType);
    
        return ctx;
    }
    
    protected initContext(moduleType : Type<any>, { router = Router() } : { router?: IRouter<any> }) : IModuleContext {
        const ctx : IModuleContext = {
            router,
            moduleType,
            metadata: ModuleRouterFactory.assertModuleAnnotation(moduleType),
            factory: this.injector.get(ControllerRouterFactory)
        };
        
        return ctx;
    }
    
    protected static assertModuleAnnotation(moduleType : Type<any>) : NemModule {
        const annotations = Annotator.getCtorAnnotations(moduleType);
        
        for(const annotation of annotations) {
            if(annotation instanceof NemModule) {
                return annotation;
            }
        }
        
        throw new Error(`Class "${moduleType.name}" has no module annotation`);
    }
    
    protected static assertNemModuleWithProviders(arg : NemModuleWithProviders|Type<any>) : NemModuleWithProviders {
        if(typeof arg === 'object' && arg.hasOwnProperty('nemModule')) {
            return arg as NemModuleWithProviders;
        }
        
        return {
            nemModule: arg as Type<any>
        }
    }
    
    protected handleImport(module : [ string|RegExp, Type<any> | NemModuleWithProviders ] |Type<any> | NemModuleWithProviders, router : IRouter<any>) {
        if(Array.isArray(module)) {
            const [ path, mod ] = module;
            const nemModule = ModuleRouterFactory.assertNemModuleWithProviders(mod);
            debug('handle import', path, nemModule.nemModule.name);
            router.use(path, this.createRouterFromModule(nemModule.nemModule).router);
        } else {
            const { nemModule } = ModuleRouterFactory.assertNemModuleWithProviders(module);
            debug('handle import', nemModule.name);
            this.createRouterFromModule(nemModule, { router });
        }
    }
    
    protected handleMiddleware(middleware : any|any[], router : IRouter<any>) {
        if(Array.isArray(middleware)) {
            router.use(...middleware);
        } else {
            router.use(middleware);
        }
    }
    
    protected handleRouter(route : string|RegExp, subRouter : Router, router : IRouter<any>) {
        router.use(route, subRouter);
    }
}
