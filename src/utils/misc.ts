import { Injector, Provider } from '@neoskop/injector';

/**
 * @internal
 * @hidden
 */
export function copyMultiProvider(tokens : any[], injector : Injector) : Provider[] {
    return tokens.map(token =>
        injector.get(token, []).map((useValue : any) => ({ provide: token, useValue, multi: true }))
    );
}
