import { NemModule } from '../../../../src/metadata/module';
import { ExampleController } from './controller/example';
import * as session from 'express-session';

@NemModule({
    controller: [
        [ '/', ExampleController ]
    ],
    middlewares: [
        session({
            secret: Math.random().toString(36),
            resave: false,
            saveUninitialized: true
        })
    ]
})
export class ExampleModule {

}
