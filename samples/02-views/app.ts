import { nem } from '../../src/bootstrap';
import { ExampleModule } from './modules/example/module';
import { viewDirectory } from '../../src/provider/view-directory';

nem({
    providers: [
        viewDirectory('./views')
    ]
}).bootstrap(ExampleModule).listen(8000);
