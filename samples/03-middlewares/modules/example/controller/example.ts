import { Controller, Get, View } from '../../../../../src/metadata/controller';
import { middleware } from '../../../../../src/provider/middleware';
import { ControllerBeforeMiddleware } from '../middlewares/controller-before';
import { ControllerAfterMiddleware } from '../middlewares/controller-after';
import { BeforeMiddleware } from '../middlewares/before';
import { Use } from '../../../../../src/metadata/middleware';
import { AfterMiddleware } from '../middlewares/after';

function globalBefore(_req : any, _res : any, next : any) {
    console.log('defined globalBefore');
    next();
}

function globalAfter(_req : any, _res : any, next : any) {
    console.log('defined globalAfter');
    next();
}

function before(_req : any, _res : any, next : any) {
    console.log('defined before');
    next();
}

function after(_req : any, _res : any, next : any) {
    console.log('defined after');
    next();
}

@Controller({
    providers: [
        middleware(ControllerBeforeMiddleware),
        middleware(globalBefore),
        middleware(ControllerAfterMiddleware, 'after'),
        middleware(globalAfter, 'after'),
        BeforeMiddleware,
        AfterMiddleware
    ]
})
export class ExampleController {
    @Get('/')
    @View('index')
    @Use(BeforeMiddleware)
    @Use(before)
    @Use(after, { use: 'after' })
    @Use(AfterMiddleware, { use: 'after' })
    index() {
        return {
            title: '03-middlewares',
            description: 'Simple example controller'
        }
    }
}
