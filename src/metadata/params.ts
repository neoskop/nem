import { Request } from 'express';

import { Annotator } from '@neoskop/annotation-factory';
import { BadRequestError } from '../errors/http';

export abstract class AbstractParam<T = any> {
    resolve!: (options: T, req : Request) => any;
    parse?: (arg : any, options : T, req : Request) => any;
    validate?: (arg : any, options : T, req : Request) => boolean;
    required?: boolean;
    paramName?: string;
    type?: any;
}

export interface ParamOptions<T = any> {
    type?: any;
    parse?: (arg: any, options : T, req : Request) => any;
    validate?: (arg : any, options : T, req : Request) => boolean;
    required?: boolean;
}

export interface ParamsOptions<T = any> {
    parse?: (arg: any, options : T, req : Request) => any;
    validate?: (arg : any, options : T, req : Request) => boolean;
}

export function parse(value : any, metadata  : AbstractParam<any>) {
    if(null == value) {
        return value;
    }
    
    switch(metadata.type) {
        case 'string':
        case 'String':
        case String: return String(value);
        case 'number':
        case 'Number':
        case 'float':
        case 'Float':
        case Number: {
            const float = parseFloat(value);
            if(Number.isNaN(float)) {
                throw new BadRequestError(`${(metadata as any).name} "${metadata.paramName}" invalid, float expected`);
            }
            return float;
        }
        case 'int':
        case 'Int':
        case 'integer':
        case 'Integer': {
            const int = parseInt(value, 10);
            if(Number.isNaN(int)) {
                throw new BadRequestError(`${(metadata as any).name} "${metadata.paramName}" invalid, integer expected`);
            }
            return int;
        }
        default: return value;
    }
}

/**
 * Type of QueryParam decorator
 */
export interface QueryParamDecorator {
    /**
     * Injects a query parameter into controller handler
     * @example
     * ```
     *
     * class ExampleController {
     *   @Get('/')
     *   index(@QueryParam('param') param : string) {
     *     // param is "foobar" for url "/?param=foobar"
     *   }
     * }
     * ```
     */
    (paramName: string, options?: ParamOptions<QueryParam>): any;
    new (paramName: string, options?: ParamOptions<QueryParam>): QueryParam;
}

/**
 * Type of QueryParam metadata
 * @see {@link QueryParamDecorator}
 */
export interface QueryParam extends AbstractParam<QueryParam>, ParamOptions<QueryParam> {
    paramName: string;
}

export const QueryParam : QueryParamDecorator = Annotator.makeParamDecorator(
    'QueryParam',
    (paramName: string, options: ParamOptions = {}) => ({
        required: false,
        type: String,
        parse,
        ...options,
        paramName,
        resolve: (options : QueryParam, req : Request) => req.query[options.paramName]
    }),
    AbstractParam);

/**
 * Type of QueryParams decorator
 */
export interface QueryParamsDecorator {
    /**
     * Injects all query parameters as object into controller handler
     * @example
     * ```
     *
     * class ExampleController {
     *   @Get('/')
     *   index(@QueryParams() params : object) {
     *     // params is `{ param: "foobar" }` for url "/?param=foobar"
     *   }
     * }
     * ```
     */
    (options?: ParamsOptions<QueryParams>): any;
    new (options?: ParamsOptions<QueryParams>): QueryParams;
}

/**
 * Type of QueryParams metadata
 * @see {@link QueryParamsDecorator}
 */
export interface QueryParams extends AbstractParam<QueryParams>, ParamsOptions<QueryParams> {
}

export const QueryParams : QueryParamsDecorator = Annotator.makeParamDecorator(
    'QueryParams',
    (options: ParamsOptions = {}) => ({
        ...options,
        resolve: (_options : QueryParams, req : Request) => req.query
    }),
    AbstractParam);

/**
 * Type of Param decorator
 */
export interface ParamDecorator {
    /**
     * Injects a path parameter into controller handler
     * @example
     * ```
     *
     * class ExampleController {
     *   @Get('/:id')
     *   index(@Param('id') id : string) {
     *     // id is "foobar" for url "/foobar"
     *   }
     * }
     * ```
     */
    (paramName: string, options?: ParamOptions<Param>): any;
    new (paramName: string, options?: ParamOptions<Param>): Param;
}

/**
 * Type of the Param metadata
 * @see {@link ParamDecorator}
 */
export interface Param extends AbstractParam<Param>, ParamOptions<Param> {
    paramName: string;
}

export const Param : ParamDecorator = Annotator.makeParamDecorator(
    'Param',
    (paramName: string, options: ParamOptions = {}) => ({
        required: true,
        type: String,
        parse,
        ...options,
        paramName,
        resolve: (options : Param, req : Request) => req.params[options.paramName]
    }),
    AbstractParam);

export interface ParamsDecorator {
    /**
     * Injects all path parameters as object into controller handler
     * @example
     * ```
     *
     * class ExampleController {
     *   @Get('/:arg0/:arg1')
     *   index(@Params() params : object) {
     *     // params is `{ arg0: "foo", arg1: "bar" }` for url "/foo/bar"
     *   }
     * }
     * ```
     */
    (options?: ParamsOptions<Params>): any;
    new (options?: ParamsOptions<Params>): Params;
}

/**
 * Type of the Params metadata
 * @see {@link ParamsDecorator}
 */
export interface Params extends AbstractParam<Params>, ParamsOptions<Params> {}

export const Params : ParamsDecorator = Annotator.makeParamDecorator(
    'Params',
    (options: ParamsOptions = {}) => ({
        ...options,
        resolve: (_options : Param, req : Request) => req.params
    }),
    AbstractParam);


/**
 * Type of the BodyParam decorator
 */
export interface BodyParamDecorator {
    /**
     * Injects a body parameter into controller handler
     * Requires an express body-parser
     * @example
     * ```
     *
     * class ExampleController {
     *   @Post('/')
     *   index(@BodyParam('id') id : string) {
     *     // id is "foobar" for post body '{"id":"foobar"}'
     *   }
     * }
     * ```
     */
    (paramName: string, options?: ParamOptions<BodyParam>): any;
    new (paramName: string, options?: ParamOptions<BodyParam>): BodyParam;
}

/**
 * Type of the BodyParam metadata
 * @see {@link BodyParamDecorator}
 */
export interface BodyParam extends AbstractParam<BodyParam>, ParamOptions<BodyParam> {
    paramName: string;
}

export const BodyParam : BodyParamDecorator = Annotator.makeParamDecorator(
    'BodyParam',
    (paramName: string, options: ParamOptions = {}) => ({
        required: false,
        parse,
        ...options,
        paramName,
        resolve: (options : BodyParam, req : Request) => req.body[options.paramName]
    }),
    AbstractParam);

export interface BodyOptions {
    parse?: (arg: { [key: string]: string }|Buffer|string|any, options : Body, req : Request) => any;
}

/**
 * Type of the Body decorator
 */
export interface BodyDecorator {
    /**
     * Injects the complete body as object, string or Buffer depends on the body-parser middleware
     * Requires an express body-parser
     * @example
     * ```
     *
     * class ExampleController {
     *   @Post('/:arg0/:arg1')
     *   index(@Body() params : object) {
     *     // params is `{ id: "foobar" }` for post body "{"id":"foobar"}"
     *   }
     * }
     * ```
     */
    (options?: BodyOptions): any;
    new (options?: BodyOptions): Body;
}

/**
 * Type of the Body metadata
 * @see {@link BodyDecorator}
 */
export interface Body extends AbstractParam<Body>, BodyOptions {
}

export const Body : BodyDecorator = Annotator.makeParamDecorator(
    'Body',
    (options: BodyOptions = {}) => ({
        ...options,
        resolve: (_options : Body, req : Request) => req.body
    }),
    AbstractParam);

/**
 * Type of the HeaderParam decorator
 */
export interface HeaderParamDecorator {
    /**
     * Injects a header parameter into controller handler
     * @example
     * ```
     *
     * class ExampleController {
     *   @Get('/')
     *   index(@HeaderParam('if-none-match') etag: string) {
     *     // etag contains the given 'If-None-Match' header
     *   }
     * }
     * ```
     */
    (headerName: string, options?: ParamOptions<HeaderParam>): any;
    new (headerName: string, options?: ParamOptions<HeaderParam>): HeaderParam;
}

/**
 * Type of the HeaderParam metadata
 * @see {@link HeaderParamDecorator}
 */
export interface HeaderParam extends AbstractParam<HeaderParam>, ParamOptions<HeaderParam> {
    headerName: string;
}

export const HeaderParam : HeaderParamDecorator = Annotator.makeParamDecorator(
    'HeaderParam',
    (headerName: string, options: ParamOptions = {}) => ({
        required: false,
        parse,
        ...options,
        headerName,
        resolve: (options : HeaderParam, req : Request) => req.headers[options.headerName.toLowerCase()]
    }),
    AbstractParam);

/**
 * Type of the Headers decorator
 */
export interface HeadersDecorator {
    /**
     * Injects all header parameters as object into controller handler
     * @example
     * ```
     *
     * class ExampleController {
     *   @Get('/')
     *   index(@Headers() headers: IncomingHttpHeaders) {
     *     // headers contains all request headers
     *   }
     * }
     * ```
     */
    (options?: ParamOptions<Headers>): any;
    new (options?: ParamOptions<Headers>): Headers;
}

/**
 * Type of the Headers metadata
 * @see {@link HeadersDecorator}
 */
export interface Headers extends AbstractParam<Headers>, ParamsOptions<Headers> {}

export const Headers : HeadersDecorator = Annotator.makeParamDecorator(
    'Headers',
    (options: ParamOptions = {}) => ({
        ...options,
        resolve: (_options : Headers, req : Request) => req.headers
    }),
    AbstractParam);

/**
 * Type of the SessionParam decorator
 */
export interface SessionParamDecorator {
    /**
     * Injects a session parameter into controller handler
     * @example
     * ```
     *
     * class ExampleController {
     *   @Get('/')
     *   index(@SessionParam('foobar') foobar: string) {
     *   }
     * }
     * ```
     */
    (paramName: string, options?: ParamOptions<SessionParam>): any;
    new (paramName: string, options?: ParamOptions<SessionParam>): SessionParam;
}

/**
 * Type of the SessionParam metadata
 * @see {@link SessionParamDecorator}
 */
export interface SessionParam extends AbstractParam<SessionParam>, ParamOptions<SessionParam> {
    paramName: string;
}

export const SessionParam : SessionParamDecorator = Annotator.makeParamDecorator(
    'SessionParam',
    (paramName: string, options: ParamOptions = {}) => ({
        required: false,
        parse,
        ...options,
        paramName,
        resolve: (options : SessionParam, req : Request) => (req as any).session![options.paramName]
    }),
    AbstractParam);

/**
 * Type of the Session decorator
 */
export interface SessionDecorator {
    /**
     * Injects the session object into controller handler
     * @example
     * ```
     *
     * class ExampleController {
     *   @Get('/')
     *   index(@Session() session: Express.Session) {
     *   }
     * }
     * ```
     */
    (options?: ParamOptions<Session>): any;
    new (options?: ParamOptions<Session>): Session;
}

/**
 * Type of the Session metadata
 * @see {@link SessionDecorator}
 */
export interface Session extends AbstractParam<Session>, ParamsOptions<Session> {
}

export const Session : SessionDecorator = Annotator.makeParamDecorator(
    'Session',
    (options: ParamOptions = {}) => ({
        ...options,
        resolve: (_options : Session, req : Request) => (req as any).session
    }),
    AbstractParam);

/**
 * Type of the SessionId decorator
 */
export interface SessionIdDecorator {
    /**
     * Injects the session id into controller handler
     * @example
     * ```
     *
     * class ExampleController {
     *   @Get('/')
     *   index(@SessionId() sessId: string) {
     *   }
     * }
     * ```
     */
    (): any;
    new (): Session;
}

/**
 * Type of the SessionId metadata
 * @see {@link SessionIdDecorator}
 */
export interface SessionId extends AbstractParam<SessionId> {}

export const SessionId : SessionIdDecorator = Annotator.makeParamDecorator(
    'SessionId',
    () => ({
        resolve: (_options : Session, req : Request) => (req as any).sessionID
    }),
    AbstractParam);

/**
 * Type of the Req decorator
 */
export interface ReqDecorator {
    /**
     * Injects the express request object into controller handler
     * @example
     * ```
     *
     * class ExampleController {
     *   @Get('/')
     *   index(@Req() req : Express.Request) {
     *   }
     * }
     * ```
     */
    (): any;
    new (): Req;
}

/**
 * Type of the Req metadata
 * @see {@link ReqDecorator}
 */
export interface Req extends AbstractParam<Req> {}

export const Req : ReqDecorator = Annotator.makeParamDecorator('Req', () => ({
    resolve: (_options : Req, req : Request) => req
}), AbstractParam);

/**
 * Type of the Res decorator
 */
export interface ResDecorator {
    /**
     * Injects the express response object into controller handler
     * @example
     * ```
     *
     * class ExampleController {
     *   @Get('/')
     *   index(@Res() res : Express.Response) {
     *   }
     * }
     * ```
     */
    (): any;
    new (): Res;
}

/**
 * Type of the Res metadata
 * @see {@link ResDecorator}
 */
export interface Res extends AbstractParam<Res> {}

export const Res : ResDecorator = Annotator.makeParamDecorator('Res', () => ({
    resolve: (_options : Res, req : Request) => (req as any).res
}), AbstractParam);

/**
 * Type of the Err decorator
 */
export interface ErrDecorator {
    /**
     * Injects the optional error from a middleware into controller handler
     * @example
     * ```
     *
     * class ExampleController {
     *   @Post('/login')
     *   @Use((_req, _res, next) => next(Math.random() < .5 ? new Error('err') : null))
     *   index(@Err() err : any, @Res() res : Express.Response) {
     *   }
     * }
     * ```
     */
    (): any;
    new (): Err;
}

/**
 * Type of the Res metadata
 * @see {@link ResDecorator}
 */
export interface Err extends AbstractParam<Err> {}

export const Err : ErrDecorator = Annotator.makeParamDecorator('Err', () => ({
    resolve: (_options : Err, req : Request) => (req as any).err
}), AbstractParam);
