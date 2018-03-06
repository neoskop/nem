import { NemModule } from '../../../../src/metadata/module';
import { ExampleController } from './controller/example';
import { viewPrefix } from '../../../../src/provider/view-prefix';

@NemModule({
    providers: [
        viewPrefix('02-views')
    ],
    controller: [
        [ '/', ExampleController ]
    ]
})
export class ExampleModule {

}
