import { VIEWS } from '../tokens';

export function viewDirectory(dir : string) {
    return { provide: VIEWS, useValue: dir, multi: true }
}
