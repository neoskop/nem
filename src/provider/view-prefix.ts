import { VIEW_PREFIX } from '../tokens';
import { Provider } from '@neoskop/injector';

/**
 * Provide an view prefix
 * @usage
 * ```
 *
 * @NemModule({
 *   providers: [
 *     viewPrefix('example-')
 *   ]
 * })
 * export class ExampleModule {}
 *
 * @Controller({
 *   providers: [
 *     viewPrefix('example-')
 *   ]
 * })
 * export class ExampleController {
 *   @Get('/')
 *   @View('index')
 *   index() { // renders template `example-index`
 *     return {}
 *   }
 * }
 * ```
 */
export function viewPrefix(prefix : string) : Provider {
    return { provide: VIEW_PREFIX, useValue: prefix };
}
