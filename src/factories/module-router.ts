import { IRouter, Router } from 'express';
import { Annotator, Type } from '../utils/annotations';
import { NemModule, NemModuleWithProviders } from '../metadata/module';
import { Injector, InjectorFactory, Provider, Injectable } from '@neoskop/injector';
import { ControllerRouterFactory } from './controller-router';
import { BASE_PATHS, MULTI_TOKENS_FROM_PARENT, VIEW_PREFIX } from '../tokens';
import { copyMultiProvider } from '../utils/misc';

/** @hidden */
const debug = require('debug')('nem:factory:module');

/**
 * @internal
 * @hidden
 */
export const MODULE_FACTORY_PROVIDER : Provider[] = [
    { provide: VIEW_PREFIX, useValue: undefined },
    ControllerRouterFactory
];

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
     * The module injector
     */
    injector : Injector;
    
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
    
    static getRootProvider(moduleType : Type<any>) : Provider[] {
        const metadata = this.assertModuleAnnotation(moduleType);
        
        return [
            ...(metadata.rootProviders || []),
            ...(metadata.modules || []).map(declaration => {
                const nemModule = this.assertNemModuleWithProviders(Array.isArray(declaration) ? declaration[1] : declaration);
                return [
                    this.getRootProvider(nemModule.nemModule),
                    ...(nemModule.rootProviders || [])
                ]
            }).reduce((t, c) => t.concat(c), [])
        ]
    }
    
    createRouterFromModule(moduleType : Type<any>, options : { providers?: Provider[], router?: IRouter<any> } = {}) : IModuleContext {
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
                this.handleRouter(path, ctx.factory.createRouterFromController(controller, {
                    providers: [
                        { provide: BASE_PATHS, useValue: path, multi: true }
                    ]
                }), ctx.router);
            }
        }
        ctx.module = ctx.injector.get(moduleType);
    
        return ctx;
    }
    
    protected initContext(moduleType : Type<any>, { providers = [], router = Router() } : { providers?: Provider[], router?: IRouter<any> }) : IModuleContext {
        const ctx : Partial<IModuleContext> = { router, moduleType };
        ctx.metadata = ModuleRouterFactory.assertModuleAnnotation(moduleType);
        ctx.injector = InjectorFactory.create({
            parent: this.injector,
            providers: [
                ...copyMultiProvider(MULTI_TOKENS_FROM_PARENT, this.injector),
                ...MODULE_FACTORY_PROVIDER,
                ...providers,
                ...(ctx.metadata.providers || []),
                moduleType
            ]
        });
        ctx.factory = ctx.injector.get(ControllerRouterFactory);
        
        return ctx as IModuleContext;
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
            router.use(path, this.createRouterFromModule(nemModule.nemModule, {
                providers: [
                    ...(nemModule.providers || []),
                    { provide: BASE_PATHS, useValue: path, multi: true }
                ]
            }).router);
        } else {
            const { nemModule, providers } = ModuleRouterFactory.assertNemModuleWithProviders(module);
            debug('handle import', nemModule.name);
            this.createRouterFromModule(nemModule, { providers, router });
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
