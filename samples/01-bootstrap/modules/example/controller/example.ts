import { Controller, Get, View } from '../../../../../src/metadata/controller';

@Controller()
export class ExampleController {
    @Get('/')
    @View('index')
    index() {
        return {
            title: '01-bootstrap',
            description: 'Simple example controller'
        }
    }
}
