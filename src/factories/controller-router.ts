import { Annotator, Type } from '../utils/annotations';
import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { AbstractController, AbstractMethod, ApplicableAnnotation } from '../metadata/controller';
import { Injectable, Injector, InjectorFactory, Provider } from '@neoskop/injector';
import { AbstractParam } from '../metadata/params';
import { ParamFactory } from './param';
import { NemRootZone } from '../zone';
import { copyMultiProvider } from '../utils/misc';
import { DEFAULT_END_HANDLER, MIDDLEWARE_BEFORE, MULTI_TOKENS_FROM_PARENT, MIDDLEWARE_AFTER } from '../tokens';
import { Result } from '../metadata/result';
import { Middleware, Use } from '../metadata/middleware';
import { IMiddleware } from '../interfaces/middleware';

declare module "express" {
    interface Request {
        injector?: Injector;
    }
}

const debug = require('debug')('nem:factory:controller');

export interface MethodAnnotationMap extends Map<Type<any>, any> {
    get(key : typeof AbstractMethod) : AbstractMethod[];
    get(key : typeof ApplicableAnnotation) : ApplicableAnnotation[];
    get(key : typeof Use) : Use[];
}

export interface IControllerContext {
    cls : Type<any>;
    metadata : AbstractController;
    injector : Injector;
    instance : any;
    methods : Map<string, MethodAnnotationMap>;
    router: Router;
}

@Injectable()
export class ControllerRouterFactory {
    
    constructor(protected injector : Injector,
                protected zone : NemRootZone,
                protected paramFactory : ParamFactory) {
    }
    
    createRouterFromController(cls : Type<any>, { providers = [] } : { providers? : Provider[] } = {}) : Router {
        debug('create router from controller', cls.name);
        const ctx = this.initContext(cls, providers);
        
        for(const [ method, annotations ] of ctx.methods) {
            const params = this.getParamsForMethod(cls, method);
            
            for(const annotation of annotations.get(AbstractMethod)) {
                ctx.router[ annotation.method ](annotation.path, this.createHandler(ctx, method, params, annotations))
            }
        }
        
        
        return ctx.router;
    }
    
    protected initContext(cls : Type<any>, providers : Provider[]) : IControllerContext {
        const ctx : Partial<IControllerContext> = { router: Router(), cls };
        ctx.metadata = this.assertControllerAnnotation(cls);
        ctx.injector = InjectorFactory.create({
            parent   : this.injector,
            providers: [
                ...copyMultiProvider(MULTI_TOKENS_FROM_PARENT, this.injector),
                ...providers,
                ...(ctx.metadata.providers || []),
                cls
            ]
        });
        ctx.instance = ctx.injector.get(cls);
        ctx.methods = this.createMethodAnnotationMap(cls);
        
        return ctx as IControllerContext;
    }
    
    protected assertControllerAnnotation(cls : Type<any>) : AbstractController {
        const annotations = Annotator.getCtorAnnotations(cls);
        
        for(const annotation of annotations) {
            if(annotation instanceof AbstractController) {
                return annotation;
            }
        }
        
        throw new Error(`Class "${cls.name}" has no controller annotation`);
    }
    
    protected createMethodAnnotationMap(cls : Type<any>) : Map<string, MethodAnnotationMap> {
        const annotations = Annotator.getPropAnnotations(cls);
        const methods = new Map<string, MethodAnnotationMap>();
        
        const types : Type<any>[] = [ AbstractMethod, ApplicableAnnotation, Use ] as any[];
        
        for(const prop in annotations) {
            methods.set(prop, new Map());
            for(const annotation of annotations[ prop ]!) {
                for(const type of types) {
                    if(annotation instanceof type) {
                        if(!methods.get(prop)!.has(type)) {
                            methods.get(prop)!.set(type, [ annotation ]);
                        } else {
                            methods.get(prop)!.get(type)!.push(annotation);
                        }
                    }
                }
            }
        }
        
        return methods;
    }
    
    protected getParamsForMethod(cls : Type<any>, method : string) : AbstractParam[] {
        const annotations = Annotator.getParamAnnotations(cls, method);
        const result : AbstractParam[] = [];
        
        for(const [ index, paramAnnotations ] of annotations.entries()) {
            const p = paramAnnotations.filter(a => a instanceof AbstractParam);
            
            if(p.length === 0) {
                throw new Error(`Missing param annotation for param ${index} of method ${cls.name}:${method}`);
            } else if(p.length > 1) {
                throw new Error(`Too many param annotations for param ${index} of method ${cls.name}:${method}`);
            }
            
            result.push(p[ 0 ]);
        }
        
        return result;
    }
    
    protected createHandler(ctx : IControllerContext, method : string, params : AbstractParam[], annotations : MethodAnnotationMap) : RequestHandler[] {
        const handler = async (request : Request, response : Response, next : NextFunction) => {
            const zone = this.zone.fork({
                name      : '',
                properties: {
                    request,
                    response
                }
            });
            
            zone.run(async () => {
                try {
                    request.injector = ctx.injector;
                    
                    const appAnnotations = annotations.get(ApplicableAnnotation) || [];
                    
                    await applyApplicableAnnotations(appAnnotations, 'before', { request, response });
                    
                    const args = await Promise.all(params.map(param => this.paramFactory.getParameterFromMetadataAndRequest(param, request)));
                    
                    const result = Result.ensure(await ctx.instance[ method ](...args));
                    
                    await applyApplicableAnnotations(result.args, 'before', { request, response });
                    
                    appAnnotations.push(...result.args);
                    
                    await applyApplicableAnnotations(appAnnotations, 'after', {
                        request,
                        response,
                        result: result.result
                    });
                    await applyApplicableAnnotations([
                        ...appAnnotations,
                        ctx.injector.get(DEFAULT_END_HANDLER, {
                            end() {
                                throw new Error('Missing end annotation')
                            }
                        })
                    ], 'end', { request, response, result: result.result }, { stopAfterFirst: true });
                    
                    next();
                } catch(e) {
                    console.log('catch', e);
                    next(e);
                }
            });
            
        };
        
        function toHandler(middleware : RequestHandler|IMiddleware) {
            if(typeof middleware === 'function') {
                return middleware;
            }
    
            return (request : Request, response : Response, next : NextFunction) => {
                (middleware as IMiddleware).use(request, response, next);
            }
        }
        
        function toHandler2(use : Use) {
            if(!Annotator.getCtorAnnotations(use.middleware as any).some(a => a instanceof Middleware)) {
                return use.middleware as RequestHandler;
            }
    
            return (request : Request, response : Response, next : NextFunction) => {
                ctx.injector.get<IMiddleware>(use.middleware as any).use(request, response, next);
            }
        }
        
        
        
        const globalBeforeHandler = ctx.injector.get(MIDDLEWARE_BEFORE, []).map(toHandler);
        const globalAfterHandler = ctx.injector.get(MIDDLEWARE_AFTER, []).map(toHandler);
        
        const useAnnotations = ctx.methods.get(method)!.get(Use) || [];
        
        const beforeHandler = useAnnotations.filter(a => a.use === 'before').map(toHandler2);
        const afterHandler = useAnnotations.filter(a => a.use === 'after').map(toHandler2);
        
        return [ ...globalBeforeHandler, ...beforeHandler, handler, ...afterHandler, ...globalAfterHandler ];
    }
}

async function applyApplicableAnnotations(app : ApplicableAnnotation[],
                                          type : 'before' | 'after' | 'end',
                                          args : { request : Request, response : Response, result? : any },
                                          { stopAfterFirst } : { stopAfterFirst? : boolean } = {}) {
    for(const a of app) {
        if(a[ type ]) {
            await (a[ type ] as any)(a, args);
            if(stopAfterFirst) {
                return;
            }
        }
    }
}
