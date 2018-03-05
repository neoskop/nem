import { Request } from 'express';

import { Annotator } from '../utils/annotations';


export interface Resolver {
    resolve: (options: this, req : Request) => any;
}

export abstract class AbstractParam implements Resolver {
    abstract resolve: (options: this, req : Request) => any;
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

// Single Query Param

export interface QueryParamDecorator {
    (paramName: string, options?: ParamOptions): any;
    new (paramName: string, options?: ParamOptions): QueryParam;
}

export interface QueryParam extends AbstractParam, ParamOptions, Resolver {
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

// All Query Params

export interface QueryParamsDecorator {
    (options?: ParamsOptions): any;
    new (options?: ParamsOptions): QueryParams;
}

export interface QueryParams extends AbstractParam, ParamsOptions, Resolver {
}

export const QueryParams : QueryParamsDecorator = Annotator.makeParamDecorator(
    'QueryParams',
    (options: ParamsOptions = {}) => ({
        ...options,
        resolve: (_options : QueryParams, req : Request) => req.query
    }),
    AbstractParam);

// Single Path Parameter

export interface ParamDecorator {
    (paramName: string, options?: ParamOptions): any;
    new (paramName: string, options?: ParamOptions): Param;
}

export interface Param extends AbstractParam, ParamOptions, Resolver {
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

// All Path Parameter

export interface ParamsDecorator {
    (options?: ParamsOptions): any;
    new (options?: ParamsOptions): Params;
}

export interface Params extends AbstractParam, ParamsOptions, Resolver {}

export const Params : ParamsDecorator = Annotator.makeParamDecorator(
    'Params',
    (options: ParamsOptions = {}) => ({
        ...options,
        resolve: (_options : Param, req : Request) => req.params
    }),
    AbstractParam);

// Single Body Parameter

export interface BodyParamDecorator {
    (paramName: string, options?: ParamOptions): any;
    new (paramName: string, options?: ParamOptions): BodyParam;
}

export interface BodyParam extends AbstractParam, ParamOptions, Resolver {
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

// Complete Body

export interface BodyOptions {
    parse?: (arg: { [key: string]: string }|Buffer|string|any, options : this, req : Request) => any;
}

export interface BodyDecorator {
    (options?: BodyOptions): any;
    new (options?: BodyOptions): Body;
}

export interface Body extends AbstractParam, BodyOptions, Resolver {
}

export const Body : BodyDecorator = Annotator.makeParamDecorator(
    'Body',
    (options: BodyOptions = {}) => ({
        ...options,
        resolve: (_options : Body, req : Request) => req.body
    }),
    AbstractParam);

// Single Header Parameter

export interface HeaderParamDecorator {
    (headerName: string, options?: ParamOptions): any;
    new (headerName: string, options?: ParamOptions): HeaderParam;
}

export interface HeaderParam extends AbstractParam, ParamOptions, Resolver {
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

// All Header Parameter

export interface HeadersDecorator {
    (options?: ParamOptions): any;
    new (options?: ParamOptions): Headers;
}

export interface Headers extends AbstractParam, ParamsOptions, Resolver {}

export const Headers : HeadersDecorator = Annotator.makeParamDecorator(
    'Headers',
    (options: ParamOptions = {}) => ({
        ...options,
        resolve: (_options : Headers, req : Request) => req.headers
    }),
    AbstractParam);

// Single Session Parameter

export interface SessionParamDecorator {
    (paramName: string, options?: ParamOptions): any;
    new (paramName: string, options?: ParamOptions): SessionParam;
}

export interface SessionParam extends AbstractParam, ParamOptions, Resolver {
    paramName: string;
}

export const SessionParam : SessionParamDecorator = Annotator.makeParamDecorator(
    'SessionParam',
    (paramName: string, options: ParamOptions = {}) => ({
        required: false,
        type: String,
        ...options,
        paramName,
        resolve: (options : SessionParam, req : Request) => req.session![options.paramName]
    }),
    AbstractParam);

// Session Parameter

export interface SessionDecorator {
    (options?: ParamOptions): any;
    new (options?: ParamOptions): Session;
}

export interface Session extends AbstractParam, ParamsOptions, Resolver {
}

export const Session : SessionDecorator = Annotator.makeParamDecorator(
    'Session',
    (options: ParamOptions = {}) => ({
        ...options,
        resolve: (_options : Session, req : Request) => req.session
    }),
    AbstractParam);

// SessionId

export interface SessionIdDecorator {
    (): any;
    new (): Session;
}

export interface SessionId extends AbstractParam, Resolver {}

export const SessionId : SessionIdDecorator = Annotator.makeParamDecorator(
    'Session',
    () => ({
        resolve: (_options : Session, req : Request) => req.sessionID
    }),
    AbstractParam);

// Request

export interface ReqDecorator {
    (): any;
    new (): Req;
}

export interface Req extends AbstractParam, Resolver {}

export const Req : ReqDecorator = Annotator.makeParamDecorator('Req', () => ({
    resolve: (_options : Req, req : Request) => req
}), AbstractParam);

// Response

export interface ResDecorator {
    (): any;
    new (): Res;
}

export interface Res extends AbstractParam, Resolver {}

export const Res : ResDecorator = Annotator.makeParamDecorator('Res', () => ({
    resolve: (_options : Res, req : Request) => (req as any).res
}), AbstractParam);
