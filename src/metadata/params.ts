import { Request } from 'express';

import { Annotator } from '../utils/annotations';


export abstract class AbstractParam {
    resolve!: (options: this, req : Request) => any;
    parse?: (arg : any, options : this, req : Request) => any;
    required?: boolean;
}

export interface ParamOptions {
    type?: any;
    parse?: (arg: any, options : this, req : Request) => any;
    required?: boolean;
}

export interface ParamsOptions {
    parse?: (arg: any, options : this, req : Request) => any;
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
    (paramName: string, options?: ParamOptions): any;
    new (paramName: string, options?: ParamOptions): QueryParam;
}

/**
 * Type of QueryParam metadata
 * @see {@link QueryParamDecorator}
 */
export interface QueryParam extends AbstractParam, ParamOptions {
    paramName: string;
}

export const QueryParam : QueryParamDecorator = Annotator.makeParamDecorator(
    'QueryParam',
    (paramName: string, options: ParamOptions = {}) => ({
        required: false,
        type: String,
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
    (options?: ParamsOptions): any;
    new (options?: ParamsOptions): QueryParams;
}

/**
 * Type of QueryParams metadata
 * @see {@link QueryParamsDecorator}
 */
export interface QueryParams extends AbstractParam, ParamsOptions {
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
    (paramName: string, options?: ParamOptions): any;
    new (paramName: string, options?: ParamOptions): Param;
}

/**
 * Type of the Param metadata
 * @see {@link ParamDecorator}
 */
export interface Param extends AbstractParam, ParamOptions {
    paramName: string;
}

export const Param : ParamDecorator = Annotator.makeParamDecorator(
    'Param',
    (paramName: string, options: ParamOptions = {}) => ({
        required: true,
        type: String,
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
    (options?: ParamsOptions): any;
    new (options?: ParamsOptions): Params;
}

/**
 * Type of the Params metadata
 * @see {@link ParamsDecorator}
 */
export interface Params extends AbstractParam, ParamsOptions {}

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
    (paramName: string, options?: ParamOptions): any;
    new (paramName: string, options?: ParamOptions): BodyParam;
}

/**
 * Type of the BodyParam metadata
 * @see {@link BodyParamDecorator}
 */
export interface BodyParam extends AbstractParam, ParamOptions {
    paramName: string;
}

export const BodyParam : BodyParamDecorator = Annotator.makeParamDecorator(
    'BodyParam',
    (paramName: string, options: ParamOptions = {}) => ({
        required: false,
        type: String,
        ...options,
        paramName,
        resolve: (options : BodyParam, req : Request) => req.body[options.paramName]
    }),
    AbstractParam);

export interface BodyOptions {
    parse?: (arg: { [key: string]: string }|Buffer|string|any, options : this, req : Request) => any;
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
export interface Body extends AbstractParam, BodyOptions {
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
    (headerName: string, options?: ParamOptions): any;
    new (headerName: string, options?: ParamOptions): HeaderParam;
}

/**
 * Type of the HeaderParam metadata
 * @see {@link HeaderParamDecorator}
 */
export interface HeaderParam extends AbstractParam, ParamOptions {
    headerName: string;
}

export const HeaderParam : HeaderParamDecorator = Annotator.makeParamDecorator(
    'HeaderParam',
    (headerName: string, options: ParamOptions = {}) => ({
        required: false,
        type: String,
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
    (options?: ParamOptions): any;
    new (options?: ParamOptions): Headers;
}

/**
 * Type of the Headers metadata
 * @see {@link HeadersDecorator}
 */
export interface Headers extends AbstractParam, ParamsOptions {}

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
    (paramName: string, options?: ParamOptions): any;
    new (paramName: string, options?: ParamOptions): SessionParam;
}

/**
 * Type of the SessionParam metadata
 * @see {@link SessionParamDecorator}
 */
export interface SessionParam extends AbstractParam, ParamOptions {
    paramName: string;
}

export const SessionParam : SessionParamDecorator = Annotator.makeParamDecorator(
    'SessionParam',
    (paramName: string, options: ParamOptions = {}) => ({
        required: false,
        type: String,
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
    (options?: ParamOptions): any;
    new (options?: ParamOptions): Session;
}

/**
 * Type of the Session metadata
 * @see {@link SessionDecorator}
 */
export interface Session extends AbstractParam, ParamsOptions {
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
export interface SessionId extends AbstractParam {}

export const SessionId : SessionIdDecorator = Annotator.makeParamDecorator(
    'Session',
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
export interface Req extends AbstractParam {}

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
     *   index(@Res() req : Express.Response) {
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
export interface Res extends AbstractParam {}

export const Res : ResDecorator = Annotator.makeParamDecorator('Res', () => ({
    resolve: (_options : Res, req : Request) => (req as any).res
}), AbstractParam);
