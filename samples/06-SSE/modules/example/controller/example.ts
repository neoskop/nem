import { Controller, Get, View, SSE } from '../../../../../src/metadata/controller';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators'
import { HeaderParam } from '../../../../../src/metadata/params';

@Controller()
export class ExampleController {
    @Get('/')
    @View('06-SSE/index.ejs')
    index() {
    }
    
    @Get('/events')
    @SSE({ retryOnError: 5000 })
    events(@HeaderParam('last-event-id', { type: 'int' }) offset: number = 0) {
        return interval(1000).pipe(
            map(counter => {
                if(counter && !(counter % 5)) {
                    throw new Error('Multiple of 5 and not 0');
                }
                return counter;
            }),
            map(counter => counter + offset),
            map(counter => ({ event: counter % 2 ? 'odd' : 'even', id: counter, data: { counter} }))
        );
    }
}
