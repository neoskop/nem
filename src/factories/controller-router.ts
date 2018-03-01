import { Annotator, Type } from '../utils/annotations';
import { NextFunction, Router, Request, Response } from 'express';
import { AbstractController, AbstractMethod } from '../metadata/controller';
import { Injector, InjectorFactory } from '@neoskop/injector';
import { Injectable } from '@angular/core';
import { AbstractParam } from '../metadata/params';
import { ParamFactory } from './param';
import { NemRootZone } from '../zone';

@Injectable()
export class ControllerRouterFactory {
    
    constructor(protected injector : Injector,
                protected zone : NemRootZone,
                protected paramFactory : ParamFactory) {
    }
    
    createRouterFromController(cls : Type<any>) : Router {
        const router = Router();
    
        const controller = this.assertControllerAnnotation(cls);
        const injector = InjectorFactory.create({
            parent: this.injector,
            providers: [
                ...(controller.providers || []),
                cls
            ]
        });
        const instance = injector.get(cls);
        const methods = this.createMethodMap(cls);
        
        for(const [ method, annotations ] of methods) {
            const params = this.getParamsForMethod(cls, method);
            
            for(const annotation of annotations) {
                router[annotation.method](annotation.path, this.createHandler(instance, method, params))
            }
        }
        
        
        return router;
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
    
    protected createMethodMap(cls : Type<any>) : Map<string, AbstractMethod[]> {
        const annotations = Annotator.getPropAnnotations(cls);
        const methods = new Map<string, AbstractMethod[]>();
    
        
        for(const prop in annotations) {
            for(const annotation of annotations[prop]!) {
                if(annotation instanceof AbstractMethod) {
                    if(methods.has(prop)) {
                        methods.get(prop)!.push(annotation);
                    } else {
                        methods.set(prop, [ annotation ]);
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
            
            result.push(p[0]);
        }
        
        return result;
    }
    
    protected createHandler(instance : any, method : string, params : AbstractParam[]) {
        return async (request : Request, response : Response, next : NextFunction) => {
            const zone = this.zone.fork({
                name: '',
                properties: {
                    request,
                    response
                }
            });
            
            zone.run(async () => {
                try {
                    const args = await Promise.all(params.map(param => this.paramFactory.getParameterFromMetadataAndRequest(param, request)));
                    
                    const result = await instance[ method ](...args);
        
                    response.end(result);
                } catch(e) {
                    next(e);
                }
            });
            
        }
    }
}
