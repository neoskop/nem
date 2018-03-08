import { NemModule, NemModuleWithProviders } from '../../../../src/metadata/module';
import { IndexController } from './controller/index';
import { InjectionToken } from '@neoskop/injector';

export const DATA = new InjectionToken<{ id: string }[]>('Rest Data');

@NemModule({
    controller: [
        [ '/', IndexController ]
    ]
})
export class IndexModule {
}
