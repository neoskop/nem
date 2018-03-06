import { Provider } from '@neoskop/injector';
import { Annotator } from '../utils/annotations';
import { Request, Response } from 'express';
import * as HttpStatus from 'http-status';
import { DEFAULT_END_HANDLER, VIEW_PREFIX } from '../tokens';
import { HttpError } from '../errors/http';
import * as path from 'path';

export abstract class AbstractController {
    providers?: Provider[]
}

export interface IControllerOptions {
    providers?: Provider[]
}

export interface ControllerDecorator {
    (options?: IControllerOptions) : any;
    new (options?: IControllerOptions) : Controller;
}

export interface Controller {

}

export const Controller : ControllerDecorator = Annotator.makeCtorDecorator('Controller', (options : IControllerOptions = {}) => options, AbstractController);

export const JsonController : ControllerDecorator = Annotator.makeCtorDecorator('JsonController', (options : IControllerOptions = {}) => {
    return {
        providers: [
            ...(options.providers || []),
            { provide: DEFAULT_END_HANDLER, useValue: new Json() }
        ]
    }
}, AbstractController);

export abstract class AbstractMethod {
    abstract method: 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
    abstract path: RegExp|string;
}

export interface MethodDecorator<T extends AbstractMethod> {
    (path : RegExp|string) : any;
    new (path : RegExp|String) : T;
}

export const MethodFactory = (method: string) => (path : RegExp|string) => ({ method, path });

export interface All extends AbstractMethod {}
export const All : MethodDecorator<All> = Annotator.makePropDecorator('All', MethodFactory('all'), AbstractMethod);

export interface Get extends AbstractMethod {}
export const Get : MethodDecorator<Get> = Annotator.makePropDecorator('Get', MethodFactory('get'), AbstractMethod);

export interface Post extends AbstractMethod {}
export const Post : MethodDecorator<Post> = Annotator.makePropDecorator('Post', MethodFactory('post'), AbstractMethod);

export interface Put extends AbstractMethod {}
export const Put : MethodDecorator<Put> = Annotator.makePropDecorator('Put', MethodFactory('put'), AbstractMethod);

export interface Delete extends AbstractMethod {}
export const Delete : MethodDecorator<Delete> = Annotator.makePropDecorator('Delete', MethodFactory('delete'), AbstractMethod);

export interface Patch extends AbstractMethod {}
export const Patch : MethodDecorator<Patch> = Annotator.makePropDecorator('Patch', MethodFactory('patch'), AbstractMethod);

export interface Options extends AbstractMethod {}
export const Options : MethodDecorator<Options> = Annotator.makePropDecorator('Options', MethodFactory('options'), AbstractMethod);

export interface Head extends AbstractMethod {}
export const Head : MethodDecorator<Head> = Annotator.makePropDecorator('Head', MethodFactory('head'), AbstractMethod);

export abstract class ApplicableAnnotation {
    abstract before?(options : this, { request, response } : { request : Request, response : Response }) : void|Promise<void>;
    abstract after?(options : this, { request, response, result } : { request : Request, response : Response, result : any }) : void|Promise<void>;
    abstract end?(options : this, { request, response, result } : { request : Request, response : Response, result : any }) : void|Promise<void>;
}

export interface ContentTypeDecorator {
    (contentType : string) : any;
    new (contentType : string) : ContentType
}

export interface ContentType extends ApplicableAnnotation {
    contentType: string;
}

export const ContentType : ContentTypeDecorator = Annotator.makePropDecorator('ContentType', (contentType : string) => ({
    contentType,
    before(options : ContentType, { response } : { request : Request, response : Response }) {
        response.contentType(options.contentType);
    }
}), ApplicableAnnotation);

export interface StatusCodeDecorator {
    (status : number) : any;
    new (status : number) : StatusCode
}

export interface StatusCode extends ApplicableAnnotation {
    status : number;
}

export const StatusCode : StatusCodeDecorator = Annotator.makePropDecorator('StatusCode', (status : number) => ({
    status,
    before(options : StatusCode, { response } : { request : Request, response : Response }) {
        response.status(options.status);
    }
}), ApplicableAnnotation);

export interface IRedirectOptions {
    status?: number;
}

export interface RedirectDecorator {
    (url : string, options?: IRedirectOptions) : any;
    new (url : string, options?: IRedirectOptions) : Redirect
}

export interface Redirect extends ApplicableAnnotation, IRedirectOptions {
    url: string;
    status: number;
}

export const Redirect : RedirectDecorator = Annotator.makePropDecorator('Redirect', (url : string, options: IRedirectOptions = {}) => ({
    status: HttpStatus.MOVED_PERMANENTLY,
    ...options,
    url,
    before(options : Redirect, { response } : { request : Request, response : Response }) {
        response.redirect(options.status, options.url);
    }
}), ApplicableAnnotation);

export interface HeaderDecorator {
    (name: string, value : string) : any;
    new (name: string, value : string) : Header
}

export interface Header extends ApplicableAnnotation {
    headerName : string;
    value : string;
}

export const Header : HeaderDecorator = Annotator.makePropDecorator('Header', (headerName : string, value : string) => ({
    headerName,
    value,
    before({ headerName, value } : Header, { response } : { request : Request, response : Response }) {
        response.header(headerName, value);
    }
}), ApplicableAnnotation);

export interface ViewDecorator {
    (view: string) : any;
    new (view: string) : View
}

export interface View extends ApplicableAnnotation {
    view : string;
}

export const View : ViewDecorator = Annotator.makePropDecorator('View', (view : string) => ({
    view,
    end({ view } : View, { request, response, result } : { request : Request, response : Response, result : any }) {
        const template = request.injector!.get(VIEW_PREFIX) ? path.join(request.injector!.get(VIEW_PREFIX)!, view) : view;
        response.render(template, result);
    }
}), ApplicableAnnotation);

export interface LocalsDecorator {
    (locals: Object) : any;
    new (locals: Object) : Locals
}

export interface Locals extends ApplicableAnnotation {
    locals : Object;
}

export const Locals : LocalsDecorator = Annotator.makePropDecorator('Locals', (locals : Object) => ({
    locals,
    before({ locals } : Locals, { response } : { request : Request, response : Response }) {
        Object.assign(response.locals, locals);
    }
}), ApplicableAnnotation);

export interface JsonDecorator {
    () : any;
    new () : Json
}

export interface Json extends ApplicableAnnotation {
}

export const Json : JsonDecorator = Annotator.makePropDecorator('Json', () => ({
    end({} : Json, { response, result } : { request : Request, response : Response, result : any }) {
        response.contentType('application/json');
        response.json(result);
    }
}), ApplicableAnnotation);

export interface RawDecorator {
    () : any;
    new () : Raw
}

export interface Raw extends ApplicableAnnotation {
}

export const Raw : RawDecorator = Annotator.makePropDecorator('Raw', () => ({
    end({} : Raw, { response, result } : { request : Request, response : Response, result : any }) {
        response.end(result);
    }
}), ApplicableAnnotation);

export interface TextDecorator {
    () : any;
    new () : Text
}

export interface Text extends ApplicableAnnotation {
}

export const Text : TextDecorator = Annotator.makePropDecorator('Text', () => ({
    end({} : Text, { response, result } : { request : Request, response : Response, result : any }) {
        if(typeof result !== 'string') {
            throw new Error(`Invalid return type. Expected "string", "${typeof result}" given`);
        }
        response.end(result);
    }
}), ApplicableAnnotation);

export interface OnUndefinedDecorator {
    (statusOrError : number|HttpError) : any;
    new (statusOrError : number|HttpError) : OnUndefined
}

export interface OnUndefined extends ApplicableAnnotation {
    statusOrError : number|HttpError;
}

export const OnUndefined : OnUndefinedDecorator = Annotator.makePropDecorator('OnUndefined', (statusOrError : number|HttpError) => ({
    statusOrError,
    after({ statusOrError } : OnUndefined, { result } : { request : Request, response : Response, result : any }) {
        if(result === undefined) {
            if(typeof statusOrError === 'number') {
                throw new HttpError(statusOrError);
            } else {
                throw statusOrError;
            }
        }
    }
}), ApplicableAnnotation);

export interface OnNullDecorator {
    (statusOrError : number|HttpError) : any;
    new (statusOrError : number|HttpError) : OnNull
}

export interface OnNull extends ApplicableAnnotation {
    statusOrError : number|HttpError;
}

export const OnNull : OnNullDecorator = Annotator.makePropDecorator('OnNull', (statusOrError : number|HttpError) => ({
    statusOrError,
    after({ statusOrError } : OnNull, { result } : { request : Request, response : Response, result : any }) {
        if(result === null) {
            if(typeof statusOrError === 'number') {
                throw new HttpError(statusOrError);
            } else {
                throw statusOrError;
            }
        }
    }
}), ApplicableAnnotation);
