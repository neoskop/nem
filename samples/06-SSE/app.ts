import { nem } from '../../src/bootstrap';
import { ExampleModule } from './modules/example/module';

nem().bootstrap(ExampleModule).listen(8000).then(() => console.log('Started...'));
