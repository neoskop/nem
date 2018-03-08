import { VIEW_PREFIX } from '../tokens';
import { Provider } from '@neoskop/injector';

export function viewPrefix(prefix : string) : Provider {
    return { provide: VIEW_PREFIX, useValue: prefix };
}
