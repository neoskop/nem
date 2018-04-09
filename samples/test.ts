import { Inject } from '@neoskop/injector';
import {
    ContentType, Controller, JsonController, Get, View, Locals, Json, Raw, Text,
    OnUndefined
} from '../src/metadata/controller';
import { Param, QueryParam } from '../src/metadata/params';
import 'zone.js';
import { NemModule } from '../src/metadata/module';
import { nem } from '../src/bootstrap';
import { VIEWS } from '../src/tokens';
import { Result } from '../src/metadata/result';

@Controller({
    providers: [
        { provide: 'FOO', useValue: 'BAR' }
    ]
})
export class SimpleController {
    
    constructor(@Inject('FOO') protected foo : string) {
        console.log({ foo });
    }
    
    @Get('/')
    @ContentType('text/plain')
    @Json()
    index(@QueryParam('word') word : string = 'World') {
        console.log({ word });
        return 'Hello ' + word
    }
    
    @Get('/echo/:text')
    @ContentType('text/plain')
    @Raw()
    echo(@Param('text') text : string) {
        return Result([ new ContentType('text/plain') ], text);
    }
    
    @Get('/test')
    test() {
        return Result([
            new ContentType('text/html'),
            new Locals({
                foobar: 'baz'
            }),
            new View('foobar')
        ], {
            foo: 'bar'
        })
    }
    
    @Get('/test2')
    @Text()
    test2() {
        return 2;
    }
    
    @Get('/html')
    @ContentType('text/html')
    html() {
        return `<!doctype html>

<html lang="en">
<head>
  <meta charset="utf-8">

  <title></title>
</head>

<body>
    <h1>HTML</h1>
</body>
</html>`
    }
}

@JsonController()
export class JsonControllerImpl {
    protected entities = [
        { id: 'foo', name: 'bar' },
        { id: 'foobar', name: 'baz' }
    ];
    
    @Get('/')
    index() {
        return this.entities;
    }
    
    @Get('/:id')
    @OnUndefined(404)
    entity(@Param('id') id : string) {
        return this.entities.find(e => e.id === id);
    }
}

@NemModule({
    controller: [
        [ '/', SimpleController ]
    ]
})
export class SubModule {
    constructor() {
        console.log(this.constructor.name, 'constructor');
    }
}

@NemModule({
    modules: [
        [ '/sub', SubModule ]
    ],
    controller: [
        [ '/', SimpleController ],
        [ '/simple', SimpleController ],
        [ '/json', JsonControllerImpl ]
    ]
})
export class SimpleModule {
    constructor() {
        console.log(this.constructor.name, 'constructor');
    }
}

// const app = express();
// const injector = InjectorFactory.create({
//     providers: [
//         ParamFactory,
//         ModuleRouterFactory,
//         { provide: NemRootZone, useValue: Zone.root }
//     ]
// });
//
// const factory = injector.get(ModuleRouterFactory);
//
// const router = factory.createRouterFromModule(SimpleModule);
//
// // const factory = injector.get(ControllerRouterFactory);
// //
// // const simpleRouter = factory.createRouterFromController(SimpleController);
//
// app.use(router);

const app = nem({
    providers: [
        { provide: VIEWS, useValue: `${__dirname}/../views`, multi: true }
    ]
}).bootstrap(SimpleModule);

// app.use(simpleRouter);
// app.use('/simple', simpleRouter);

// app.get('/', (req : express.Request, res : express.Response) => {
//     console.log({ req, res }, (req as any).res === res);
//     res.end('Hello World')
// });

app.listen(8000, () => {
    console.log('Started');
});
