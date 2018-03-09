import { NemModule } from '../../../../src/metadata/module';
import { ExampleController } from './controller/example';

@NemModule({
    controller: [
        [ '/', ExampleController ]
    ]
})
export class ExampleModule {

}
