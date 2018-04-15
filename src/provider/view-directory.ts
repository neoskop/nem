import { VIEWS } from '../tokens';
import { Provider } from '@neoskop/injector';

/**
 * Provide an additional view directory
 * @usage
 * ```
 *
 * nem({
 *   providers: [
 *     viewDirectory('./views')
 *   ]
 * }).bootstrap(ExampleModule).listen(8000);
 *
 *
 * @NemModule({
 *   providers: [
 *     viewDirectory('./views/example')
 *   ]
 * })
 * export class ExampleModule {}
 * ```
 */
export function viewDirectory(dir : string) : Provider {
    return { provide: VIEWS, useValue: dir, multi: true }
}
