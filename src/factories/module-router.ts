import { Router } from 'express';
import { Annotator, Type } from '../utils/annotations';
import { NemModule, NemModuleWithProviders } from '../metadata/module';
import { Injector, InjectorFactory, Provider, Injectable } from '@neoskop/injector';
import { ControllerRouterFactory } from './controller-router';
import { BASE_PATHS, MULTI_TOKENS_FROM_PARENT, VIEW_PREFIX } from '../tokens';
import { copyMultiProvider } from '../utils/misc';
const debug = require('debug')('nem:factory:module');

export const MODULE_FACTORY_PROVIDER : Provider[] = [
    { provide: VIEW_PREFIX, useValue: undefined },
    ControllerRouterFactory
];

export interface IModuleContext {
    cls : Type<any>;
    metadata : NemModule;
    injector : Injector;
    factory: ControllerRouterFactory;
    router : Router;
}

@Injectable()
export class ModuleRouterFactory {
    
    constructor(protected injector : Injector) {
    }
    
    getRootProvider(cls : Type<any>) : Provider[] {
        const metadata = this.assertModuleAnnotation(cls);
        
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
    
    createRouterFromModule(cls : Type<any>, { providers = [] } : { providers?: Provider[] } = {}) : Router {
        debug('create router from module', cls.name);
        
        const ctx = this.initContext(cls, providers);
        
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
        ctx.injector.get(cls);
    
        return ctx.router;
    }
    
    protected initContext(cls : Type<any>, providers: Provider[]) : IModuleContext {
        const ctx : Partial<IModuleContext> = { router: Router(), cls };
        ctx.metadata = this.assertModuleAnnotation(cls);
        ctx.injector = InjectorFactory.create({
            parent: this.injector,
            providers: [
                ...copyMultiProvider(MULTI_TOKENS_FROM_PARENT, this.injector),
                ...MODULE_FACTORY_PROVIDER,
                ...providers,
                ...(ctx.metadata.providers || []),
                cls
            ]
        });
        ctx.factory = ctx.injector.get(ControllerRouterFactory);
        
        return ctx as IModuleContext;
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
    
    protected assertNemModuleWithProviders(arg : NemModuleWithProviders|Type<any>) : NemModuleWithProviders {
        if(typeof arg === 'object' && arg.hasOwnProperty('nemModule')) {
            return arg as NemModuleWithProviders;
        }
        
        return {
            nemModule: arg as Type<any>
        }
    }
    
    protected handleImport(module : [ string|RegExp, Type<any> | NemModuleWithProviders ] |Type<any> | NemModuleWithProviders, router : Router) {
        if(Array.isArray(module)) {
            const [ path, mod ] = module;
            const nemModule = this.assertNemModuleWithProviders(mod);
            debug('handle import', path, nemModule.nemModule.name);
            router.use(path, this.createRouterFromModule(nemModule.nemModule, {
                providers: [
                    ...(nemModule.providers || []),
                    { provide: BASE_PATHS, useValue: path, multi: true }
                ]
            }));
        } else {
            const { nemModule, providers } = this.assertNemModuleWithProviders(module);
            debug('handle import', nemModule.name);
            router.use(this.createRouterFromModule(nemModule, { providers }));
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
