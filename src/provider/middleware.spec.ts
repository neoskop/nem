import 'mocha';
import { expect } from 'chai';
import { middleware } from './middleware';
import { MIDDLEWARE_AFTER, MIDDLEWARE_BEFORE } from '../tokens';
import { Middleware } from '../metadata/middleware';

@Middleware()
class MiddlewareImpl {

}

describe('provider/middleware', () => {
    describe('middleware', () => {
        it('should return value provider', () => {
            function handler() {}
            expect(middleware(handler)).to.be.eql({ provide: MIDDLEWARE_BEFORE, useValue: handler, multi: true });
            expect(middleware(handler, 'after')).to.be.eql({ provide: MIDDLEWARE_AFTER, useValue: handler, multi: true });
        });
        
        it('should return class provider', () => {
            expect(middleware(MiddlewareImpl)).to.be.eql({ provide: MIDDLEWARE_BEFORE, useClass: MiddlewareImpl, multi: true });
            expect(middleware(MiddlewareImpl, 'after')).to.be.eql({ provide: MIDDLEWARE_AFTER, useClass: MiddlewareImpl, multi: true });
        });
    });
    
});
