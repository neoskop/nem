/**
 * Inspired and copied from @angular/core
 * @see https://github.com/angular/angular/blob/master/packages/core/src/util/decorators.ts
 *
 * @todo export into @neoskop/annotation-factory
 */

/**
 * @internal
 * @hidden
 */
export const ANNOTATIONS = '__ANNOTATIONS__';

/**
 * @internal
 * @hidden
 */
export const PROPS = '__PROPS__';

/**
 * @internal
 * @hidden
 */
export const CTOR_PARAMS = '__CTOR_PARAMS__';

/**
 * @internal
 * @hidden
 */
export const PARAMS = '__PARAMS__';

export interface Type<T> extends Function {
    new (...args : any[]) : T;
}

export interface AnnotatedType<T> extends Type<T> {
    /** @hidden */
    [ANNOTATIONS]?: any[];
    /** @hidden */
    [PROPS]?: { [P in keyof T]?: any[] };
    /** @hidden */
    [CTOR_PARAMS]?: any[][];
    /** @hidden */
    [PARAMS]?: { [P in keyof T]?: any[][] };
}

export interface TypeDecorator {
    <T extends Type<any>>(type : T): T;
    (target : Object, propertyKey?: string|symbol, parameterIndex?: number): void;
}

export class Annotator {
    
    static getCtorAnnotations<T>(cls : AnnotatedType<T>) : any[] {
        return cls[ ANNOTATIONS ] || [];
    }
    
    static getPropAnnotations<T>(cls : AnnotatedType<T>) : { [P in keyof T]? : any[] };
    static getPropAnnotations<T>(cls : AnnotatedType<T>, prop : keyof T) : any[];
    static getPropAnnotations<T>(cls : AnnotatedType<T>, prop? : keyof T) : any[] | { [P in keyof T]? : any[] } {
        if(prop) {
            return (cls[ PROPS ] && cls[ PROPS ]![ prop ] || []) as any;
        }
        return cls[ PROPS ]! || {};
    }
    
    static getCtorParamAnnotations<T>(cls : AnnotatedType<T>) : any[][] {
        return cls[ CTOR_PARAMS ]! || [];
    }
    
    static getParamAnnotations<T>(cls : AnnotatedType<T>, prop : keyof T) : any[][] {
        return (cls[ PARAMS ] && cls[ PARAMS ]![ prop ] || []) as any;
    }
    
    static makeCtorDecorator(name : string, props? : (...args : any[]) => any, parentClass? : any) : any {
        const metaCtor = makeMetadataCtor(props);
        
        function DecoratorFactory(this : any, objOrType : any) {
            if(this instanceof DecoratorFactory) {
                metaCtor.call(this, objOrType);
                return this;
            }
            
            const instance = new (DecoratorFactory as any)(objOrType);
            
            const TypeDecorator : TypeDecorator = <TypeDecorator>function TypeDecorator(cls : Function) {
                const annotations = cls.hasOwnProperty(ANNOTATIONS) ?
                    (cls as any)[ ANNOTATIONS ] :
                    Object.defineProperty(cls, ANNOTATIONS, { value: [] })[ ANNOTATIONS ];
                annotations.push(instance);
                return cls;
            };
            
            return TypeDecorator;
        }
        
        if(parentClass) {
            DecoratorFactory.prototype = Object.create(parentClass.prototype);
        }
        
        Object.defineProperty(DecoratorFactory.prototype, 'name', {
            enumerable: true,
            writable  : false,
            value     : name
        });
        
        return DecoratorFactory;
    }
    
    static makePropDecorator(name : string, props? : (...args : any[]) => any, parentClass? : any) : any {
        const metaCtor = makeMetadataCtor(props);
        
        function PropDecoratorFactory(this : any, ...args : any[]) {
            if(this instanceof PropDecoratorFactory) {
                metaCtor.apply(this, args);
                return this;
            }
            
            function PropDecorator(cls : { constructor : Function }, name : string) {
                const constructor = cls.constructor;
                const instance = new (PropDecoratorFactory as any)(...args);
                
                const meta = constructor.hasOwnProperty(PROPS) ?
                    (constructor as any)[ PROPS ] :
                    Object.defineProperty(constructor, PROPS, { value: {} })[ PROPS ];
                meta[ name ] = meta.hasOwnProperty(name) && meta[ name ] || [];
                meta[ name ].unshift(instance);
            }
            
            return PropDecorator;
        }
        
        if(parentClass) {
            PropDecoratorFactory.prototype = Object.create(parentClass.prototype);
        }
        
        Object.defineProperty(PropDecoratorFactory.prototype, 'name', {
            enumerable: true,
            writable  : false,
            value     : name
        });
        
        return PropDecoratorFactory;
    }
    
    static makeParamDecorator(name : string, props? : (...args : any[]) => any, parentClass? : any) : any {
        const metaCtor = makeMetadataCtor(props);
        
        function ParamDecoratorFactory(this : any, ...args : any[]) {
            if(this instanceof ParamDecoratorFactory) {
                metaCtor.apply(this, args);
                return this;
            }
            
            function ParamDecorator(cls : any, method : string | symbol, index : number) {
                const instance = new (ParamDecoratorFactory as any)(...args);
                if(method) {
                    const parameters = cls.constructor.hasOwnProperty(PARAMS) ?
                        (cls.constructor as any)[ PARAMS ] :
                        Object.defineProperty(cls.constructor, PARAMS, { value: {} })[ PARAMS ];
                    parameters[ method ] = parameters.hasOwnProperty(method) && parameters[ method ] || [];
                    
                    while(parameters[ method ].length <= index) {
                        parameters[ method ].push(null);
                    }
                    
                    (parameters[ method ][ index ] = parameters[ method ][ index ] || []).push(instance);
                } else {
                    const parameters = cls.hasOwnProperty(CTOR_PARAMS) ?
                        (cls as any)[ CTOR_PARAMS ] :
                        Object.defineProperty(cls, CTOR_PARAMS, { value: [] })[ CTOR_PARAMS ];
                    
                    while(parameters.length <= index) {
                        parameters.push(null);
                    }
                    
                    (parameters[ index ] = parameters[ index ] || []).push(instance);
                }
                return cls;
            }
            
            return ParamDecorator;
        }
        
        if(parentClass) {
            ParamDecoratorFactory.prototype = Object.create(parentClass.prototype);
        }
        
        Object.defineProperty(ParamDecoratorFactory.prototype, 'name', {
            enumerable: true,
            writable  : false,
            value     : name
        });
        
        return ParamDecoratorFactory;
    }
}

/**
 * @internal
 * @hidden
 */
function makeMetadataCtor(props? : (...args : any[]) => any) : Function {
    return function ctor(this : any, ...args : any[]) {
        if(props) {
            const values = props(...args);
            for(const propName in values) {
                this[ propName ] = values[ propName ];
            }
        }
    };
}
