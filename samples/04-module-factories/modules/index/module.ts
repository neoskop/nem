import { InjectionToken } from '@neoskop/injector';
import { NemModule } from '../../../../src/metadata/module';
import { IndexController } from './controller/index';

export const DATA = new InjectionToken<{ id: string }[]>('Rest Data');

@NemModule({
    controller: [
        [ '/', IndexController ]
    ]
})
export class IndexModule {
}
