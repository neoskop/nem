import { Controller, Get, View } from '../../../../../src/metadata/controller';

@Controller()
export class ExampleController {
    @Get('/')
    @View('index')
    index() {
        return {
            title: '02-views',
            description: 'Simple example controller'
        }
    }
}
