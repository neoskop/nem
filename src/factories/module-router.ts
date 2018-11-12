import { Annotator, Type } from '@neoskop/annotation-factory';
import { Injectable, Injector, InjectorFactory, Provider } from '@neoskop/injector';
import { IRouter, Router } from 'express';
import { NemModule, NemModuleWithProviders } from '../metadata/module';
import { ROUTER } from '../tokens';
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
    
    /**
     * The module injector
     */
    injector : Injector;
}

@Injectable()
export class ModuleRouterFactory {
    
    constructor(protected injector : Injector) {
    }
    
    static getProviders(moduleType : Type<any>) : Provider[] {
        const metadata = this.assertModuleAnnotation(moduleType);
        
        return [
            ...(metadata.modules || []).map(declaration => {
                const nemModule = this.assertNemModuleWithProviders(Array.isArray(declaration) ? declaration[1] : declaration);
                return [
                    this.getProviders(nemModule.nemModule),
                    ...(nemModule.providers || [])
                ]
            }).reduce((t, c) => t.concat(c), []),
            ...(metadata.providers || [])
        ]
    }
    
    createRouterFromModule(moduleType : Type<any>, options : { router?: IRouter<any>, moduleProviders?: Provider[] } = {}) : IModuleContext {
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
        ctx.module = ctx.injector.get(moduleType);
    
        return ctx;
    }
    
    protected initContext(moduleType : Type<any>, { router = Router(), moduleProviders = [] } : { router?: IRouter<any>, moduleProviders?: Provider[] }) : IModuleContext {
        const metadata = ModuleRouterFactory.assertModuleAnnotation(moduleType);
        const injector = InjectorFactory.create({
            parent: this.injector,
            providers: [
                moduleType,
                { provide: ControllerRouterFactory, useClass: this.injector.get(ControllerRouterFactory).constructor },
                ...(metadata.moduleProviders || []),
                ...moduleProviders,
                { provide: ROUTER, useValue: router }
            ]
        });
        const ctx : IModuleContext = {
            router,
            moduleType,
            metadata,
            factory: injector.get(ControllerRouterFactory),
            injector
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
            const { nemModule, moduleProviders } = ModuleRouterFactory.assertNemModuleWithProviders(mod);
            debug('handle import', path, nemModule.name);
            router.use(path, this.createRouterFromModule(nemModule, { moduleProviders }).router);
        } else {
            const { nemModule, moduleProviders } = ModuleRouterFactory.assertNemModuleWithProviders(module);
            debug('handle import', nemModule.name);
            this.createRouterFromModule(nemModule, { router, moduleProviders });
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
