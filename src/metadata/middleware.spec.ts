import 'mocha';
import { expect } from 'chai';
import { Annotator } from '@neoskop/annotation-factory';
import { Middleware, Use } from './middleware';

@Middleware()
class MiddlewareTestClass {}

class UseTestClass {
    @Use(MiddlewareTestClass)
    simple() {}
    
    @Use(MiddlewareTestClass, { use: 'after' })
    withUse() {}
}

describe('metadata/middleware', () => {
    describe('Middleware', () => {
        it('should store metadata', () => {
            const annotations = Annotator.getCtorAnnotations(MiddlewareTestClass);
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[0]).to.be.instanceOf(Middleware);
        })
    });
    
    describe('Use', () => {
        it('should store metadata with defaults', () => {
            const annotations = Annotator.getPropAnnotations(UseTestClass, 'simple');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[0]).to.be.instanceOf(Use);
            expect(annotations[0].middleware).to.be.equal(MiddlewareTestClass);
            expect(annotations[0].use).to.be.equal('before');
        });
        
        it('should store metadata with options', () => {
            const annotations = Annotator.getPropAnnotations(UseTestClass, 'withUse');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[0]).to.be.instanceOf(Use);
            expect(annotations[0].middleware).to.be.equal(MiddlewareTestClass);
            expect(annotations[0].use).to.be.equal('after');
        });
    });
});
