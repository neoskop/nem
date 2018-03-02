import 'mocha';
import { expect } from 'chai';
import {
    BadRequestError, ForbiddenError, HttpError, InternalServerError, NotAcceptableError, NotFoundError,
    NotImplementedError,
    PreconditionFailedError,
    UnauthorizedError, UnsupportedMediaTypeError
} from './http';

describe('errors/http', () => {
    
    
    describe('HttpError', () => {
        it('should inherit correct', () => {
            const error = new HttpError(400);
            
            expect(error).to.be.instanceOf(HttpError);
            expect(error.stack).to.have.string('HttpError');
        });
        
        it('should have the correct http status code', () => {
            const error = new HttpError(400);
            
            expect(error.code).to.be.equal(400);
        });
        
        it('should have a default message', () => {
            const error = new HttpError(400);
            
            expect(error.message).to.be.equal('Bad Request');
        });
        
        it('should have the provided message', () => {
            const error = new HttpError(400, 'BAD_REQUEST');
            
            expect(error.message).to.be.equal('BAD_REQUEST');
        });
        
        it('should have the provided error', () => {
            const parent = Symbol('error');
            const error = new HttpError(400, null, parent);
            
            expect(error.error).to.be.equal(parent);
        })
    });
    
    for(const [ ctor, code, message, defaultMessage, err ] of [
        [ BadRequestError, 400, 'Foobar', 'Bad Request', Symbol('Bad Request') ],
        [ UnauthorizedError, 401, 'Foobar', 'Unauthorized', Symbol('Unauthorized') ],
        [ ForbiddenError, 403, 'Foobar', 'Forbidden', Symbol('Forbidden') ],
        [ NotFoundError, 404, 'Foobar', 'Not Found', Symbol('Not Found') ],
        [ NotAcceptableError, 406, 'Foobar', 'Not Acceptable', Symbol('Not Acceptable') ],
        [ PreconditionFailedError, 412, 'Foobar', 'Precondition Failed', Symbol('Precondition Failed') ],
        [ UnsupportedMediaTypeError, 415, 'Foobar', 'Unsupported Media Type', Symbol('Unsupported Media Type') ],
        [ InternalServerError, 500, 'Foobar', 'Internal Server Error', Symbol('Internal Server Error') ],
        [ NotImplementedError, 501, 'Foobar', 'Not Implemented', Symbol('Not Implemented') ],
    ] as any[]) {
        describe(ctor.name, () => {
            it('should inherit correct', () => {
                const error = new ctor();
    
                expect(error).to.be.instanceOf(ctor);
                expect(error).to.be.instanceOf(HttpError);
                expect(error.stack).to.have.string(ctor.name);
            });
    
            it('should have the correct http status code', () => {
                const error = new ctor();
        
                expect(error.code).to.be.equal(code);
            });
    
            it('should have a message', () => {
                const error = new ctor();
        
                expect(error.message).to.be.equal(defaultMessage);
            });
    
            it('should have the provided message', () => {
                const error = new ctor(message);
        
                expect(error.message).to.be.equal(message);
            });
    
            it('should have the provided error', () => {
                const error = new ctor(null, err);
        
                expect(error.error).to.be.equal(err);
            })
        })
    }
    
});
