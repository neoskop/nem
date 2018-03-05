import 'mocha';
import { expect } from 'chai';
import {
    AbstractParam,
    Body,
    BodyParam,
    HeaderParam,
    Headers,
    Param,
    Params,
    QueryParam,
    QueryParams,
    Req,
    Res,
    Session,
    SessionId,
    SessionParam
} from './params';
import { Annotator } from '../utils/annotations';
import { Request } from 'express';

class TestClass {
    queryParam(@QueryParam('foobar', { type: Number }) _a : any) {
    }
    
    queryParams(@QueryParams() _a : any) {
    }
    
    param(@Param('baz') _a : any) {
    }
    
    params(@Params() _a : any) {
    }
    
    bodyParam(@BodyParam('foo') _a : any) {
    }
    
    body(@Body() _a : any) {
    }
    
    header(@Header('Accepts') _a : any) {
    }
    
    headers(@Headers() _a : any) {
    }
    
    sessionParam(@SessionParam('sess') _a : any) {
    }
    
    session(@Session() _a : any) {
    }
    
    sessionId(@SessionId() _a : any) {}
    
    request(@Req() _a : any) {}
    
    response(@Res() _a : any) {}
}

describe('metadata/params', () => {
    let REQ : Request;
    
    beforeEach(() => {
        REQ = {
            query    : { 'foobar': 'baz', 'foo': 'bar' },
            params   : { 'baz': 'bar' },
            body     : { 'foo': 'bar' },
            headers  : { 'accepts': 'text/plain' },
            session  : { 'sess': 'sess-value' },
            sessionID: '5355ID',
            res: Symbol('Response')
        } as any
    });
    
    describe('QueryParam', () => {
        
        it('should store metadata', () => {
            const annotations = Annotator.getParamAnnotations(TestClass, 'queryParam');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.an('array').with.length(1);
            
            expect(annotations[ 0 ][ 0 ]).to.be.instanceOf(QueryParam).and.instanceOf(AbstractParam);
            
            expect(annotations[ 0 ][ 0 ]).to.have.keys('paramName', 'type', 'required', 'resolve');
            for(const [ key, value ] of Object.entries({
                paramName: 'foobar',
                type     : Number,
                required : false
            })) {
                expect(annotations[ 0 ][ 0 ][ key ]).to.be.equal(value);
            }
        });
        
        it('should resolve value from request', () => {
            const [ [ annotation ] ] = Annotator.getParamAnnotations(TestClass, 'queryParam');
            
            expect(annotation.resolve).to.be.a('function');
            expect(annotation.resolve.length).to.be.equal(2);
            
            expect(annotation.resolve(annotation, REQ)).to.be.equal('baz');
        });
    });
    
    describe('QueryParams', () => {
        
        it('should store metadata', () => {
            const annotations = Annotator.getParamAnnotations(TestClass, 'queryParams');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.an('array').with.length(1);
            
            expect(annotations[ 0 ][ 0 ]).to.be.instanceOf(QueryParams).and.instanceOf(AbstractParam);
            
            expect(annotations[ 0 ][ 0 ]).to.have.keys('resolve');
        });
        
        it('should resolve value from request', () => {
            const [ [ annotation ] ] = Annotator.getParamAnnotations(TestClass, 'queryParams');
            
            expect(annotation.resolve).to.be.a('function');
            expect(annotation.resolve.length).to.be.equal(2);
            
            expect(annotation.resolve(annotation, REQ)).to.be.eql({ 'foobar': 'baz', 'foo': 'bar' });
        });
    });
    
    describe('Param', () => {
        
        it('should store metadata', () => {
            const annotations = Annotator.getParamAnnotations(TestClass, 'param');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.an('array').with.length(1);
            
            expect(annotations[ 0 ][ 0 ]).to.be.instanceOf(Param).and.instanceOf(AbstractParam);
            
            expect(annotations[ 0 ][ 0 ]).to.have.keys('paramName', 'type', 'required', 'resolve');
            for(const [ key, value ] of Object.entries({
                paramName: 'baz',
                type     : String,
                required : true
            })) {
                expect(annotations[ 0 ][ 0 ][ key ]).to.be.equal(value);
            }
        });
        
        it('should resolve value from request', () => {
            const [ [ annotation ] ] = Annotator.getParamAnnotations(TestClass, 'param');
            
            expect(annotation.resolve).to.be.a('function');
            expect(annotation.resolve.length).to.be.equal(2);
            
            expect(annotation.resolve(annotation, REQ)).to.be.equal('bar');
        });
    });
    
    describe('Params', () => {
        
        it('should store metadata', () => {
            const annotations = Annotator.getParamAnnotations(TestClass, 'params');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.an('array').with.length(1);
            
            expect(annotations[ 0 ][ 0 ]).to.be.instanceOf(Params).and.instanceOf(AbstractParam);
            
            expect(annotations[ 0 ][ 0 ]).to.have.keys('resolve');
        });
        
        it('should resolve value from request', () => {
            const [ [ annotation ] ] = Annotator.getParamAnnotations(TestClass, 'params');
            
            expect(annotation.resolve).to.be.a('function');
            expect(annotation.resolve.length).to.be.equal(2);
            
            expect(annotation.resolve(annotation, REQ)).to.be.eql({ 'baz': 'bar' });
        });
    });
    
    describe('BodyParam', () => {
        
        it('should store metadata', () => {
            const annotations = Annotator.getParamAnnotations(TestClass, 'bodyParam');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.an('array').with.length(1);
            
            expect(annotations[ 0 ][ 0 ]).to.be.instanceOf(BodyParam).and.instanceOf(AbstractParam);
            
            expect(annotations[ 0 ][ 0 ]).to.have.keys('paramName', 'type', 'required', 'resolve');
            for(const [ key, value ] of Object.entries({
                paramName: 'foo',
                type     : String,
                required : false
            })) {
                expect(annotations[ 0 ][ 0 ][ key ]).to.be.equal(value);
            }
        });
        
        it('should resolve value from request', () => {
            const [ [ annotation ] ] = Annotator.getParamAnnotations(TestClass, 'bodyParam');
            
            expect(annotation.resolve).to.be.a('function');
            expect(annotation.resolve.length).to.be.equal(2);
            
            expect(annotation.resolve(annotation, REQ)).to.be.equal('bar');
        });
    });
    
    describe('Body', () => {
        
        it('should store metadata', () => {
            const annotations = Annotator.getParamAnnotations(TestClass, 'body');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.an('array').with.length(1);
            
            expect(annotations[ 0 ][ 0 ]).to.be.instanceOf(Body).and.instanceOf(AbstractParam);
            
            expect(annotations[ 0 ][ 0 ]).to.have.keys('resolve');
        });
        
        it('should resolve value from request', () => {
            const [ [ annotation ] ] = Annotator.getParamAnnotations(TestClass, 'body');
            
            expect(annotation.resolve).to.be.a('function');
            expect(annotation.resolve.length).to.be.equal(2);
            
            expect(annotation.resolve(annotation, REQ)).to.be.eql({ 'foo': 'bar' });
        });
    });
    
    describe('Header', () => {
        
        it('should store metadata', () => {
            const annotations = Annotator.getParamAnnotations(TestClass, 'header');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.an('array').with.length(1);
            
            expect(annotations[ 0 ][ 0 ]).to.be.instanceOf(HeaderParam).and.instanceOf(AbstractParam);
            
            expect(annotations[ 0 ][ 0 ]).to.have.keys('headerName', 'type', 'required', 'resolve');
            for(const [ key, value ] of Object.entries({
                headerName: 'Accepts',
                type      : String,
                required  : false
            })) {
                expect(annotations[ 0 ][ 0 ][ key ]).to.be.equal(value);
            }
        });
        
        it('should resolve value from request', () => {
            const [ [ annotation ] ] = Annotator.getParamAnnotations(TestClass, 'header');
            
            expect(annotation.resolve).to.be.a('function');
            expect(annotation.resolve.length).to.be.equal(2);
            
            expect(annotation.resolve(annotation, REQ)).to.be.equal('text/plain');
        });
    });
    
    describe('Headers', () => {
        
        it('should store metadata', () => {
            const annotations = Annotator.getParamAnnotations(TestClass, 'headers');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.an('array').with.length(1);
            
            expect(annotations[ 0 ][ 0 ]).to.be.instanceOf(Headers).and.instanceOf(AbstractParam);
            
            expect(annotations[ 0 ][ 0 ]).to.have.keys('resolve');
        });
        
        it('should resolve value from request', () => {
            const [ [ annotation ] ] = Annotator.getParamAnnotations(TestClass, 'headers');
            
            expect(annotation.resolve).to.be.a('function');
            expect(annotation.resolve.length).to.be.equal(2);
            
            expect(annotation.resolve(annotation, REQ)).to.be.eql({ 'accepts': 'text/plain' });
        });
    });
    
    describe('SessionParam', () => {
        
        it('should store metadata', () => {
            const annotations = Annotator.getParamAnnotations(TestClass, 'sessionParam');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.an('array').with.length(1);
            
            expect(annotations[ 0 ][ 0 ]).to.be.instanceOf(SessionParam).and.instanceOf(AbstractParam);
            
            expect(annotations[ 0 ][ 0 ]).to.have.keys('paramName', 'type', 'required', 'resolve');
            for(const [ key, value ] of Object.entries({
                paramName: 'sess',
                type     : String,
                required : false
            })) {
                expect(annotations[ 0 ][ 0 ][ key ]).to.be.equal(value);
            }
        });
        
        it('should resolve value from request', () => {
            const [ [ annotation ] ] = Annotator.getParamAnnotations(TestClass, 'sessionParam');
            
            expect(annotation.resolve).to.be.a('function');
            expect(annotation.resolve.length).to.be.equal(2);
            
            expect(annotation.resolve(annotation, REQ)).to.be.equal('sess-value');
        });
    });
    
    describe('Session', () => {
        
        it('should store metadata', () => {
            const annotations = Annotator.getParamAnnotations(TestClass, 'session');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.an('array').with.length(1);
            
            expect(annotations[ 0 ][ 0 ]).to.be.instanceOf(Session).and.instanceOf(AbstractParam);
            
            expect(annotations[ 0 ][ 0 ]).to.have.keys('resolve');
        });
        
        it('should resolve value from request', () => {
            const [ [ annotation ] ] = Annotator.getParamAnnotations(TestClass, 'session');
            
            expect(annotation.resolve).to.be.a('function');
            expect(annotation.resolve.length).to.be.equal(2);
            
            expect(annotation.resolve(annotation, REQ)).to.be.eql({ 'sess': 'sess-value' });
        });
    });
    
    describe('SessionId', () => {
        
        it('should store metadata', () => {
            const annotations = Annotator.getParamAnnotations(TestClass, 'sessionId');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.an('array').with.length(1);
            
            expect(annotations[ 0 ][ 0 ]).to.be.instanceOf(SessionId).and.instanceOf(AbstractParam);
            
            expect(annotations[ 0 ][ 0 ]).to.have.keys('resolve');
        });
        
        it('should resolve value from request', () => {
            const [ [ annotation ] ] = Annotator.getParamAnnotations(TestClass, 'sessionId');
            
            expect(annotation.resolve).to.be.a('function');
            expect(annotation.resolve.length).to.be.equal(2);
            
            expect(annotation.resolve(annotation, REQ)).to.be.equal('5355ID');
        });
    });
    
    describe('Req', () => {
        
        it('should store metadata', () => {
            const annotations = Annotator.getParamAnnotations(TestClass, 'request');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.an('array').with.length(1);

            expect(annotations[ 0 ][ 0 ]).to.be.instanceOf(Req).and.instanceOf(AbstractParam);

            expect(annotations[ 0 ][ 0 ]).to.have.keys('resolve');
        });
        
        it('should resolve value from request', () => {
            const [ [ annotation ] ] = Annotator.getParamAnnotations(TestClass, 'request');
            
            expect(annotation.resolve).to.be.a('function');
            expect(annotation.resolve.length).to.be.equal(2);
            
            expect(annotation.resolve(annotation, REQ)).to.be.equal(REQ);
        });
    });
    
    describe('Res', () => {
        
        it('should store metadata', () => {
            const annotations = Annotator.getParamAnnotations(TestClass, 'response');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.an('array').with.length(1);
            
            expect(annotations[ 0 ][ 0 ]).to.be.instanceOf(Res).and.instanceOf(AbstractParam);
            
            expect(annotations[ 0 ][ 0 ]).to.have.keys('resolve');
        });
        
        it('should resolve value from request', () => {
            const [ [ annotation ] ] = Annotator.getParamAnnotations(TestClass, 'response');
            
            expect(annotation.resolve).to.be.a('function');
            expect(annotation.resolve.length).to.be.equal(2);
            
            expect(annotation.resolve(annotation, REQ)).to.be.equal((REQ as any).res);
        });
    });
});
