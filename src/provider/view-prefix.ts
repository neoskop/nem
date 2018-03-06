import { VIEW_PREFIX } from '../tokens';

export function viewPrefix(prefix : string) {
    return { provide: VIEW_PREFIX, useValue: prefix };
}
