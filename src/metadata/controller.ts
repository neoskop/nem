import { Provider } from '@neoskop/injector';
import { Annotator } from '../utils/annotations';

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

export abstract class AbstractMethod {
    abstract method: 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
    abstract path: RegExp|string;
}

export interface MethodDecorator {
    (path : RegExp|string) : any;
    new (path : RegExp|String) : any;
}

export const MethodFactory = (method: string) => (path : RegExp|string) => ({ method, path });

export interface All extends AbstractMethod {}
export const All : MethodDecorator = Annotator.makePropDecorator('All', MethodFactory('all'), AbstractMethod);

export interface Get extends AbstractMethod {}
export const Get : MethodDecorator = Annotator.makePropDecorator('Get', MethodFactory('get'), AbstractMethod);

export interface Post extends AbstractMethod {}
export const Post : MethodDecorator = Annotator.makePropDecorator('Post', MethodFactory('post'), AbstractMethod);

export interface Put extends AbstractMethod {}
export const Put : MethodDecorator = Annotator.makePropDecorator('Put', MethodFactory('put'), AbstractMethod);

export interface Delete extends AbstractMethod {}
export const Delete : MethodDecorator = Annotator.makePropDecorator('Delete', MethodFactory('delete'), AbstractMethod);

export interface Patch extends AbstractMethod {}
export const Patch : MethodDecorator = Annotator.makePropDecorator('Patch', MethodFactory('patch'), AbstractMethod);

export interface Options extends AbstractMethod {}
export const Options : MethodDecorator = Annotator.makePropDecorator('Options', MethodFactory('options'), AbstractMethod);

export interface Head extends AbstractMethod {}
export const Head : MethodDecorator = Annotator.makePropDecorator('Head', MethodFactory('head'), AbstractMethod);
