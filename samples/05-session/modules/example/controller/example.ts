import { Controller, Get, View } from '../../../../../src/metadata/controller';
import { Session } from '../../../../../src/metadata/params';

@Controller()
export class ExampleController {
    @Get('/')
    @View('example')
    index(@Session() session : Express.Session) {
        if(typeof session.callCount !== 'undefined') {
            session.callCount++;
        } else {
            session.callCount = 0;
        }
        return {
            title: '05-session',
            sessionId: session.id,
            callCount: session.callCount
        }
    }
}
