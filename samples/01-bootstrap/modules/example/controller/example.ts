import { Controller, Get, View } from '../../../../../src/metadata/controller';

@Controller()
export class ExampleController {
    @Get('/')
    @View('index')
    index() {
        return {
            title: 'ExampleController',
            description: 'Simple example controller'
        }
    }
}
