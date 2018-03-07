import { NemModule, NemModuleWithProviders } from '../../../../src/metadata/module';
import { RestController } from './controller/rest';
import { InjectionToken } from '@neoskop/injector';

export const DATA = new InjectionToken<{ id: string }[]>('Rest Data');

@NemModule({
    controller: [
        [ '/', RestController ]
    ]
})
export class RestModule {
    static forData(data : { id: string }[]) : NemModuleWithProviders {
        return {
            nemModule: RestModule,
            providers: [
                { provide: DATA, useValue: data }
            ]
        }
    }
}
