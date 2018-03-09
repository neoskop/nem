import { Get, Controller, View } from '../../../../../src/metadata/controller';


@Controller()
export class IndexController {
    
    @Get('/')
    @View('index')
    index() {
        return {
            title: 'Foobar'
        }
    }
}
