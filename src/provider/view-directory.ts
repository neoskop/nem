import { VIEWS } from '../tokens';
import { Provider } from '@neoskop/injector';

export function viewDirectory(dir : string) : Provider {
    return { provide: VIEWS, useValue: dir, multi: true }
}
