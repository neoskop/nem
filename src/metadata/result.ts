import { ApplicableAnnotation } from './controller';

/**
 * @see {@link Result}
 */
export interface ResultCtor<T> {
    ensure<T>(arg : Result<T>|T) : Result<T>;
    
    new (argsOrResult : ApplicableAnnotation[]|any, result? : T): Result<T>;
    (argsOrResult : ApplicableAnnotation[]|any, result? : T): Result<T>;
}

/**
 * To return metadata and a result from a controller
 * @example
 * ```
 *
 * @Controller()
 * export class ExampleController {
 *
 *   @Get('/')
 *   index() {
 *     return Result([
 *       new Header('ETag', '"foobar"'),
 *       new Json()
 *     ], { foo: 'bar' });
 *   }
 * }
 *
 * // equivalent to
 *
 * @Controller()
 * export class ExampleController {
 *
 *   @Get('/')
 *   @Header('ETag', '"foobar"')
 *   @Json()
 *   index() {
 *     return { foo: 'bar' };
 *   }
 * }
 * ```
 */
export interface Result<T> {
    readonly args : ApplicableAnnotation[];
    readonly result : T;
}
export const Result : ResultCtor<any> = <ResultCtor<any>>function(this : Result<any>|null, argsOrResult : ApplicableAnnotation[]|any, result? : any) {
    if(!(this instanceof Result)) {
        return new (Result as any)(...arguments);
    }
    
    const argsGiven = Array.isArray(argsOrResult) && argsOrResult.every(a => a instanceof ApplicableAnnotation);
    if(arguments.length >= 2) {
        if(!argsGiven) {
            throw new Error('Invalid arguments');
        }
        (this as any).args = argsOrResult;
        (this as any).result = result;
    } else if(argsGiven) {
        (this as any).args = argsOrResult;
        (this as any).result = undefined;
    } else {
        (this as any).args = [];
        (this as any).result = argsOrResult;
    }
    
    return this;
};

Result.ensure = function<T>(arg : T|Result<T>) : Result<T> {
    if(arg instanceof Result) {
        return arg as Result<T>;
    }

    return new Result([], arg);
};
