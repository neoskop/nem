import 'mocha';
import { expect, use } from 'chai';
import { Annotator } from '../utils/annotations';
import * as ctrl from './controller';
import {
    AbstractController,
    AbstractMethod,
    All,
    ApplicableAnnotation,
    ContentType, Controller,
    Delete,
    Get,
    Head,
    Header,
    Json, JsonController,
    Locals, OnNull,
    OnUndefined,
    Options,
    Patch,
    Post,
    Put,
    Raw,
    Redirect,
    StatusCode,
    Text,
    View
} from './controller';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { NotFoundError } from '../errors/http';
import { DEFAULT_END_HANDLER } from '../tokens';

use(sinonChai);

class TestClass {
    @All('/')
    all() {
    
    }
    
    @Get('/')
    get() {
    
    }
    
    @Post('/')
    post() {
    
    }
    
    @Put('/')
    put() {
    
    }
    
    @Delete('/')
    delete() {
    
    }
    
    @Patch('/')
    patch() {
    
    }
    
    @Options('/')
    options() {
    
    }
    
    @Head('/')
    head() {
    
    }
    
    @ContentType('foo/bar')
    contentType() {}
    
    @StatusCode(204)
    statusCode() {}
    
    @Redirect('/redirect-to')
    redirect() {}
    
    @Redirect('/redirect-to-with-status', { status: 302 })
    redirectWithStatus() {}
    
    @Header('foo', 'bar')
    header() {}
    
    @View('foobar.html')
    view() {}
    
    @Locals({
        foo: 'bar'
    })
    locals() {}
    
    @Json()
    json() {}
    
    @Raw()
    raw() {}
    
    @Text()
    text() {}
    
    @OnUndefined(404)
    onUndefinedWithStatus() {}
    
    @OnUndefined(new NotFoundError())
    onUndefinedWithError() {}
    
    @OnNull(404)
    onNullWithStatus() {}
    
    @OnNull(new NotFoundError())
    onNullWithError() {}
}

@Controller()
class DefaultControllerImpl {

}

@JsonController()
class JsonControllerImpl {

}

describe('metadata/controller', () => {
    describe('Controller', () => {
        it('should store metadata', () => {
            const annotations = Annotator.getCtorAnnotations(DefaultControllerImpl);
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[0]).to.be.instanceOf(Controller).and.instanceOf(AbstractController);
        })
    });
    
    describe('JsonController', () => {
        it('should store metadata', () => {
            const annotations = Annotator.getCtorAnnotations(JsonControllerImpl);
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[0]).to.be.instanceOf(JsonController).and.instanceOf(AbstractController);
            expect(annotations[0].providers).to.be.an('array').with.length(1);
            expect(annotations[0].providers[0].provide).to.be.equal(DEFAULT_END_HANDLER);
            expect(annotations[0].providers[0].useValue).to.be.instanceOf(Json);
        })
    });
    
    for(const type of [ 'All', 'Get', 'Post', 'Put', 'Delete', 'Patch', 'Options', 'Head' ]) {
        describe(type, () => {
            it('should store metadata', () => {
                const annotations = Annotator.getPropAnnotations(TestClass, type.toLowerCase() as any);
            
                expect(annotations).to.be.an('array').with.length(1);
            
                expect(annotations[ 0 ]).to.be.instanceOf((ctrl as any)[type]).and.instanceOf(AbstractMethod);
            
                expect(annotations[ 0 ]).to.be.eql(new (ctrl as any)[type]('/'));
            });
        });
    }
    
    describe('ContentType', () => {
        it('should store metadata', () => {
            const annotations = Annotator.getPropAnnotations(TestClass, 'contentType');
        
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.instanceOf(ContentType).and.instanceOf(ApplicableAnnotation);
            expect(annotations[ 0 ].contentType).to.be.equal('foo/bar');
        });
        
        it('should set contentType on response', () => {
            const spy = sinon.spy();
            const response = { contentType: spy };
            
            const [ contentTypeAnnotation ] = Annotator.getPropAnnotations(TestClass, 'contentType');
            
            contentTypeAnnotation.before(contentTypeAnnotation, { response });
            
            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWith('foo/bar');
        })
    });
    
    describe('StatusCode', () => {
        it('should store metadata', () => {
            const annotations = Annotator.getPropAnnotations(TestClass, 'statusCode');
        
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.instanceOf(StatusCode).and.instanceOf(ApplicableAnnotation);
            expect(annotations[ 0 ].status).to.be.equal(204);
        });
        
        it('should set contentType on response', () => {
            const spy = sinon.spy();
            const response = { status: spy };
            
            const [ statusAnnotation ] = Annotator.getPropAnnotations(TestClass, 'statusCode');
            
            statusAnnotation.before(statusAnnotation, { response });
            
            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWith(204);
        })
    });
    
    describe('Redirect', () => {
        it('should store metadata with defaults', () => {
            const annotations = Annotator.getPropAnnotations(TestClass, 'redirect');
        
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.instanceOf(Redirect).and.instanceOf(ApplicableAnnotation);
            expect(annotations[ 0 ].url).to.be.equal('/redirect-to');
            expect(annotations[ 0 ].status).to.be.equal(301);
        });
        
        it('should store metadata with options', () => {
            const annotations = Annotator.getPropAnnotations(TestClass, 'redirectWithStatus');
        
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.instanceOf(Redirect).and.instanceOf(ApplicableAnnotation);
            expect(annotations[ 0 ].url).to.be.equal('/redirect-to-with-status');
            expect(annotations[ 0 ].status).to.be.equal(302);
        });
        
        it('should set redirect on response', () => {
            const spy = sinon.spy();
            const response = { redirect: spy };
            
            const [ redirectAnnotation ] = Annotator.getPropAnnotations(TestClass, 'redirectWithStatus');
            
            redirectAnnotation.before(redirectAnnotation, { response });
            
            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWith(302, '/redirect-to-with-status');
        })
    });
    
    describe('Header', () => {
        it('should store metadata', () => {
            const annotations = Annotator.getPropAnnotations(TestClass, 'header');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.instanceOf(Header).and.instanceOf(ApplicableAnnotation);
            expect(annotations[ 0 ].headerName).to.be.equal('foo');
            expect(annotations[ 0 ].value).to.be.equal('bar');
        });
        
        it('should set header on response', () => {
            const spy = sinon.spy();
            const response = { header: spy };
            
            const [ headerAnnotation ] = Annotator.getPropAnnotations(TestClass, 'header');
            
            headerAnnotation.before(headerAnnotation, { response });
            
            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWith('foo', 'bar');
        })
    });
    
    describe('View', () => {
        it('should store metadata', () => {
            const annotations = Annotator.getPropAnnotations(TestClass, 'view');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.instanceOf(View).and.instanceOf(ApplicableAnnotation);
            expect(annotations[ 0 ].view).to.be.equal('foobar.html');
        });
        
        it('should render response', () => {
            const spy = sinon.spy();
            const response = { render: spy };
            const request = { injector: { get() { return undefined }} };
            
            const [ renderAnnotation ] = Annotator.getPropAnnotations(TestClass, 'view');
            const result = {};
            
            renderAnnotation.end(renderAnnotation, { request, response, result });
            
            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWith('foobar.html', result);
        })
    });
    
    describe('Locals', () => {
        it('should store metadata', () => {
            const annotations = Annotator.getPropAnnotations(TestClass, 'locals');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.instanceOf(Locals).and.instanceOf(ApplicableAnnotation);
            expect(annotations[ 0 ].locals).to.be.eql({ foo: 'bar' });
        });
        
        it('should render response', () => {
            const response = { locals: { foobar: 'baz'} };
            
            const [ localAnnotation ] = Annotator.getPropAnnotations(TestClass, 'locals');
            
            localAnnotation.before(localAnnotation, { response });
            
            expect(response.locals).to.be.eql({ foobar: 'baz', foo: 'bar' })
        })
    });
    
    describe('Json', () => {
        it('should store metadata', () => {
            const annotations = Annotator.getPropAnnotations(TestClass, 'json');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.instanceOf(Json).and.instanceOf(ApplicableAnnotation);
        });
        
        it('should send json response', () => {
            const contentType = sinon.spy();
            const json = sinon.spy();
            const response = { contentType, json };
            
            const [ jsonAnnotation ] = Annotator.getPropAnnotations(TestClass, 'json');
            const result = { foo: 'bar' };
            
            jsonAnnotation.end(jsonAnnotation, { response, result });
            
            expect(contentType).to.have.been.calledOnce.and.calledWith('application/json');
            expect(json).to.have.been.calledOnce.and.calledWith(result);
        })
    });
    
    describe('Raw', () => {
        it('should store metadata', () => {
            const annotations = Annotator.getPropAnnotations(TestClass, 'raw');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.instanceOf(Raw).and.instanceOf(ApplicableAnnotation);
        });
        
        it('should send response', () => {
            const end = sinon.spy();
            const response = { end };
            
            const [ rawAnnotation ] = Annotator.getPropAnnotations(TestClass, 'raw');
            const result = { foo: 'bar' };
            
            rawAnnotation.end(rawAnnotation, { response, result });
            
            expect(end).to.have.been.calledOnce.and.calledWith(result);
        })
    });
    
    describe('Text', () => {
        it('should store metadata', () => {
            const annotations = Annotator.getPropAnnotations(TestClass, 'text');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.instanceOf(Text).and.instanceOf(ApplicableAnnotation);
        });
        
        it('should send text response', () => {
            const end = sinon.spy();
            const response = { end };
            
            const [ rawAnnotation ] = Annotator.getPropAnnotations(TestClass, 'text');
            const result = 'foobar';
            
            rawAnnotation.end(rawAnnotation, { response, result });
            
            expect(end).to.have.been.calledOnce.and.calledWith(result);
        });
        
        it('should throw on invalid result', () => {
            const [ rawAnnotation ] = Annotator.getPropAnnotations(TestClass, 'text');
            
            expect(() => {
                rawAnnotation.end(rawAnnotation, { result: {} });
            }).to.throw('Invalid return type. Expected "string", "object" given')
        })
    });
    
    describe('OnUndefined', () => {
        it('should store metadata', () => {
            const annotations = Annotator.getPropAnnotations(TestClass, 'onUndefinedWithStatus');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.instanceOf(OnUndefined).and.instanceOf(ApplicableAnnotation);
            expect(annotations[ 0 ].statusOrError).to.be.equal(404);
            
            const annotations2 = Annotator.getPropAnnotations(TestClass, 'onUndefinedWithError');
            
            expect(annotations2).to.be.an('array').with.length(1);
            expect(annotations2[ 0 ]).to.be.instanceOf(OnUndefined).and.instanceOf(ApplicableAnnotation);
            expect(annotations2[ 0 ].statusOrError).to.be.instanceOf(NotFoundError)
        });
        
        it('should throw error on undefined result', () => {
            const response = {};
            const [ statusAnnotation ] = Annotator.getPropAnnotations(TestClass, 'onUndefinedWithStatus');

            expect(() => {
                statusAnnotation.after(statusAnnotation, { response, result: undefined });
            }).to.throw('Not Found');
            
            const [ statusAnnotation2 ] = Annotator.getPropAnnotations(TestClass, 'onUndefinedWithError');

            expect(() => {
                statusAnnotation2.after(statusAnnotation2, { response, result: undefined });
            }).to.throw('Not Found');
        });
        
        it('should not throw on defined result', () => {
            const response = {};
            const [ statusAnnotation ] = Annotator.getPropAnnotations(TestClass, 'onUndefinedWithStatus');
    
            expect(() => {
                statusAnnotation.after(statusAnnotation, { response, result: {} });
            }).not.to.throw();
        })
    });
    
    describe('OnNull', () => {
        it('should store metadata', () => {
            const annotations = Annotator.getPropAnnotations(TestClass, 'onNullWithStatus');
            
            expect(annotations).to.be.an('array').with.length(1);
            expect(annotations[ 0 ]).to.be.instanceOf(OnNull).and.instanceOf(ApplicableAnnotation);
            expect(annotations[ 0 ].statusOrError).to.be.equal(404);
            
            const annotations2 = Annotator.getPropAnnotations(TestClass, 'onNullWithError');
            
            expect(annotations2).to.be.an('array').with.length(1);
            expect(annotations2[ 0 ]).to.be.instanceOf(OnNull).and.instanceOf(ApplicableAnnotation);
            expect(annotations2[ 0 ].statusOrError).to.be.instanceOf(NotFoundError)
        });
        
        it('should throw error on undefined result', () => {
            const response = {};
            const [ statusAnnotation ] = Annotator.getPropAnnotations(TestClass, 'onNullWithStatus');

            expect(() => {
                statusAnnotation.after(statusAnnotation, { response, result: null });
            }).to.throw('Not Found');
            
            const [ statusAnnotation2 ] = Annotator.getPropAnnotations(TestClass, 'onNullWithError');

            expect(() => {
                statusAnnotation2.after(statusAnnotation2, { response, result: null });
            }).to.throw('Not Found');
        });
        
        it('should not throw on defined result', () => {
            const response = {};
            const [ statusAnnotation ] = Annotator.getPropAnnotations(TestClass, 'onNullWithStatus');
    
            expect(() => {
                statusAnnotation.after(statusAnnotation, { response, result: {} });
            }).not.to.throw();
        })
    });
});
