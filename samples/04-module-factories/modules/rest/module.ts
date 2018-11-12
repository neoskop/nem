import { NemModule, NemModuleWithProviders } from '../../../../src/metadata/module';
import { RestController } from './controller/rest';
import { InjectionToken } from '@neoskop/injector';

export const DATA = new InjectionToken<{ id: string }[]>('Rest Data');

@NemModule({
    controller: [
        [ '/', RestController ]
    ],
    moduleProviders: [
        { provide: DATA, useValue: [{ id: 'default', name: 'Default' }]}
    ]
})
export class RestModule {
    static forData(data : { id: string }[]) : NemModuleWithProviders {
        return {
            nemModule: RestModule,
            moduleProviders: [
                { provide: DATA, useValue: data }
            ]
        }
    }
}
