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

/**
 * Type of Controller decorator
 */
export interface ControllerDecorator {
    /**
     * Defines a class as controller
     * @example
     * ```
     *
     * @Controller()
     * export class TestController() {}
     * ```
     */
    (options?: IControllerOptions) : any;
    new (options?: IControllerOptions) : Controller;
}

/**
 * Type of Controller metadata
 * @see {@link ControllerDecorator}
 */
export interface Controller extends AbstractController {

}

export const Controller : ControllerDecorator = Annotator.makeCtorDecorator('Controller', (options : IControllerOptions = {}) => options, AbstractController);

/**
 * Type of Controller decorator
 */
export interface JsonControllerDecorator {
    /**
     * Defines a class as json controller
     * @example
     * ```
     *
     *
     * @JsonController()
     * export class JsonController() {}
     * ```
     */
    (options?: IControllerOptions) : any;
    new (options?: IControllerOptions) : JsonController;
}

/**
 * Type of JsonController metadata
 * @see {@link JsonControllerDecorator}
 */
export interface JsonController extends AbstractController {

}

export const JsonController : JsonControllerDecorator = Annotator.makeCtorDecorator('JsonController', (options : IControllerOptions = {}) => {
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

/**
 * Type of Method decorator
 */
export interface MethodDecorator<T extends AbstractMethod> {
    (path : RegExp|string) : any;
    new (path : RegExp|String) : T;
}

const MethodFactory = (method: string) => (path : RegExp|string) => ({ method, path });

/**
 * Type of All metadata
 * @see {@link MethodDecorator}
 * @example
 * ```
 *
 * @Controller()
 * export class TestController {
 *   @All('/')
 *   index() {}
 * }
 * ```
 */
export interface All extends AbstractMethod {}

export const All : MethodDecorator<All> = Annotator.makePropDecorator('All', MethodFactory('all'), AbstractMethod);

/**
 * Type of Get metadata
 * @see {@link MethodDecorator}
 * @example
 * ```
 *
 * @Controller()
 * export class TestController {
 *   @Get('/')
 *   index() {}
 * }
 * ```
 */
export interface Get extends AbstractMethod {}

export const Get : MethodDecorator<Get> = Annotator.makePropDecorator('Get', MethodFactory('get'), AbstractMethod);

/**
 * Type of Post metadata
 * @see {@link MethodDecorator}
 * @example
 * ```
 *
 * @Controller()
 * export class TestController {
 *   @Post('/')
 *   index() {}
 * }
 * ```
 */
export interface Post extends AbstractMethod {}

export const Post : MethodDecorator<Post> = Annotator.makePropDecorator('Post', MethodFactory('post'), AbstractMethod);

/**
 * Type of Put metadata
 * @see {@link MethodDecorator}
 * @example
 * ```
 *
 * @Controller()
 * export class TestController {
 *   @Put('/')
 *   index() {}
 * }
 * ```
 */
export interface Put extends AbstractMethod {}

export const Put : MethodDecorator<Put> = Annotator.makePropDecorator('Put', MethodFactory('put'), AbstractMethod);

/**
 * Type of Delete metadata
 * @see {@link MethodDecorator}
 * @example
 * ```
 *
 * @Controller()
 * export class TestController {
 *   @Delete('/')
 *   index() {}
 * }
 * ```
 */
export interface Delete extends AbstractMethod {}

export const Delete : MethodDecorator<Delete> = Annotator.makePropDecorator('Delete', MethodFactory('delete'), AbstractMethod);

/**
 * Type of Patch metadata
 * @see {@link MethodDecorator}
 * @example
 * ```
 *
 * @Controller()
 * export class TestController {
 *   @Patch('/')
 *   index() {}
 * }
 * ```
 */
export interface Patch extends AbstractMethod {}

export const Patch : MethodDecorator<Patch> = Annotator.makePropDecorator('Patch', MethodFactory('patch'), AbstractMethod);

/**
 * Type of Options metadata
 * @see {@link MethodDecorator}
 * @example
 * ```
 *
 * @Controller()
 * export class TestController {
 *   @Options('/')
 *   index() {}
 * }
 * ```
 */
export interface Options extends AbstractMethod {}

export const Options : MethodDecorator<Options> = Annotator.makePropDecorator('Options', MethodFactory('options'), AbstractMethod);

/**
 * Type of Head metadata
 * @see {@link MethodDecorator}
 * @example
 * ```
 *
 * @Controller()
 * export class TestController {
 *   @Head('/')
 *   index() {}
 * }
 * ```
 */
export interface Head extends AbstractMethod {}

export const Head : MethodDecorator<Head> = Annotator.makePropDecorator('Head', MethodFactory('head'), AbstractMethod);

export abstract class ApplicableAnnotation {
    abstract before?(options : this, { request, response } : { request : Request, response : Response }) : void|Promise<void>;
    abstract after?(options : this, { request, response, result } : { request : Request, response : Response, result : any }) : void|Promise<void>;
    abstract end?(options : this, { request, response, result } : { request : Request, response : Response, result : any }) : void|Promise<void>;
}

/**
 * Type of ContentType decorator
 */
export interface ContentTypeDecorator {
    (contentType : string) : any;
    new (contentType : string) : ContentType
}

/**
 * Type of ContentType metadata
 */
export interface ContentType extends ApplicableAnnotation {
    contentType: string;
}

export const ContentType : ContentTypeDecorator = Annotator.makePropDecorator('ContentType', (contentType : string) => ({
    contentType,
    before(options : ContentType, { response } : { request : Request, response : Response }) {
        response.contentType(options.contentType);
    }
}), ApplicableAnnotation);

/**
 * Type of StatusCode decorator
 */
export interface StatusCodeDecorator {
    /**
     * Defines a status code
     * @example
     * ```
     * @Controller()
     * export class TestController {
     *   @Get('/')
     *   @StatusCode(202)
     *   index() {}
     *
     *   @Get('/test')
     *   test() {
     *     return Result([ new StatusCode(201) ]);
     *   }
     * }
     * ```
     */
    (status : number) : any;
    new (status : number) : StatusCode
}

/**
 * Type of StatusCode metadata
 */
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

/**
 * Type of Redirect decorator
 */
export interface RedirectDecorator {
    /**
     * Defines a redirect
     * @example
     * ```
     * @Controller()
     * export class TestController {
     *   @Get('/')
     *   @Redirect('https://example.com')
     *   index() {}
     *
     *   @Get('/test')
     *   test() {
     *     return Result([ new Redirect('https://example.com') ]);
     *   }
     * }
     * ```
     */
    (url : string, options?: IRedirectOptions) : any;
    new (url : string, options?: IRedirectOptions) : Redirect
}

/**
 * Type of Redirect metadata
 */
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

/**
 * Type of Header decorator
 */
export interface HeaderDecorator {
    /**
     * Defines a header
     * @example
     * ```
     * @Controller()
     * export class TestController {
     *   @Get('/')
     *   @Header('ETag', 'foobar')
     *   index() {}
     *
     *   @Get('/test')
     *   test() {
     *     return Result([ new Header('ETag', 'foobar') ]);
     *   }
     * }
     * ```
     */
    (name: string, value : string) : any;
    new (name: string, value : string) : Header
}

/**
 * Type of Header metadata
 */
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

/**
 * Type of View decorator
 */
export interface ViewDecorator {
    /**
     * Defines the view to render
     * @example
     * ```
     * @Controller()
     * export class TestController {
     *   @Get('/')
     *   @View('index')
     *   index() {}
     *
     *   @Get('/test')
     *   test() {
     *     return Result([ new View('test) ]);
     *   }
     * }
     * ```
     */
    (view: string) : any;
    new (view: string) : View
}

/**
 * Type of View metadata
 */
export interface View extends ApplicableAnnotation {
    view : string;
}

export const View : ViewDecorator = Annotator.makePropDecorator('View', (view : string) => ({
    view,
    end({ view } : View, { request, response, result } : { request : Request, response : Response, result : any }) {
        const template = request.injector!.get(VIEW_PREFIX, false) ? path.join(request.injector!.get(VIEW_PREFIX)!, view) : view;
        response.render(template, result);
    }
}), ApplicableAnnotation);

/**
 * Type of Locals decorator
 */
export interface LocalsDecorator {
    /**
     * Defines local view variables
     * @example
     * ```
     * @Controller()
     * export class TestController {
     *   @Get('/')
     *   @Locals({ foo: 'bar' })
     *   index() {}
     *
     *   @Get('/test')
     *   test() {
     *     return Result([ new Locals({ foo: 'bar' }) ]);
     *   }
     * }
     * ```
     */
    (locals: Object) : any;
    new (locals: Object) : Locals
}

/**
 * Type of Locals metadata
 */
export interface Locals extends ApplicableAnnotation {
    locals : Object;
}

export const Locals : LocalsDecorator = Annotator.makePropDecorator('Locals', (locals : Object) => ({
    locals,
    before({ locals } : Locals, { response } : { request : Request, response : Response }) {
        Object.assign(response.locals, locals);
    }
}), ApplicableAnnotation);

/**
 * Type of Json decorator
 */
export interface JsonDecorator {
    /**
     * Defines controller handler to return json
     * @example
     * ```
     * @Controller()
     * export class TestController {
     *   @Get('/')
     *   @Json()
     *   index() {
     *     return null;
     *   }
     *
     *   @Get('/test')
     *   test() {
     *     return Result([ new Json() ], null);
     *   }
     * }
     * ```
     */
    () : any;
    new () : Json
}

/**
 * Type of Json metadata
 */
export interface Json extends ApplicableAnnotation {
}

export const Json : JsonDecorator = Annotator.makePropDecorator('Json', () => ({
    end({} : Json, { response, result } : { request : Request, response : Response, result : any }) {
        response.contentType('application/json');
        response.json(result);
    }
}), ApplicableAnnotation);

/**
 * Type of Raw decorator
 */
export interface RawDecorator {
    /**
     * Defines controller handler to return raw data
     * @example
     * ```
     * @Controller()
     * export class TestController {
     *   @Get('/')
     *   @Raw()
     *   index() {
     *     return 'string';
     *   }
     *
     *   @Get('/test')
     *   test() {
     *     return Result([ new Raw() ], new Buffer('buffer'));
     *   }
     * }
     * ```
     */
    () : any;
    new () : Raw
}

/**
 * Type of Raw metadata
 */
export interface Raw extends ApplicableAnnotation {
}

export const Raw : RawDecorator = Annotator.makePropDecorator('Raw', () => ({
    end({} : Raw, { response, result } : { request : Request, response : Response, result : any }) {
        response.end(result);
    }
}), ApplicableAnnotation);

/**
 * Type of Text decorator
 */
export interface TextDecorator {
    /**
     * Defines controller handler to return text
     * @example
     * ```
     * @Controller()
     * export class TestController {
     *   @Get('/')
     *   @Text()
     *   index() {
     *     return null;
     *   }
     *
     *   @Get('/test')
     *   test() {
     *     return Result([ new Text() ], null); // throw an error
     *   }
     * }
     * ```
     */
    () : any;
    new () : Text
}

/**
 * Type of Text metadata
 */
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

/**
 * Type of Noop decorator
 */
export interface NoopDecorator {
    /**
     * Defines controller handler to do nothing
     * @example
     * ```
     * @Controller()
     * export class TestController {
     *   @Post('/login')
     *   @Use(passport.authenticate({ successRedirect: '/', failureRedirect: '/login' })
     *   @Noop()
     *   doLogin() {}
     * }
     * ```
     */
    () : any;
    new () : Noop;
}

/**
 * Type of Noop metadata
 */
export interface Noop extends ApplicableAnnotation {

}

export const Noop : NoopDecorator = Annotator.makePropDecorator('Noop', () => ({
    end() {}
}), ApplicableAnnotation);

/**
 * Type of OnUndefined decorator
 */
export interface OnUndefinedDecorator {
    /**
     * Defines what to do on `undefined` return value
     * @example
     * ```
     * @Controller()
     * export class TestController {
     *   @Get('/')
     *   @OnUndefined(404)
     *   index() {
     *   }
     *
     *   @Get('/test')
     *   test() {
     *     return Result([ new OnUndefined(new NotFoundError()) ]);
     *   }
     * }
     * ```
     */
    (statusOrError : number|HttpError) : any;
    new (statusOrError : number|HttpError) : OnUndefined
}

/**
 * Type of OnUndefined metadata
 */
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

/**
 * Type of OnNull decorator
 */
export interface OnNullDecorator {
    /**
     * Defines what to do on `null` return value
     * @example
     * ```
     * @Controller()
     * export class TestController {
     *   @Get('/')
     *   @OnUndefined(404)
     *   index() {
     *     return null
     *   }
     *
     *   @Get('/test')
     *   test() {
     *     return Result([ new OnUndefined(new NotFoundError()) ], null);
     *   }
     * }
     * ```
     */
    (statusOrError : number|HttpError) : any;
    new (statusOrError : number|HttpError) : OnNull
}

/**
 * Type of OnNull metadata
 */
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
