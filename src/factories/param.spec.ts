import 'mocha';
import { expect, use } from 'chai';
import { AbstractParam, QueryParam } from '../metadata/params'
import { ParamFactory } from './param';
import { Request } from 'express';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';

use(sinonChai);

const REQUEST : any = {
    query: {
        foo: '1'
    }
};

class AsyncParam extends AbstractParam {
    
    parse?: (arg: any, options : this, req : Request) => any;
    paramName: string;
    
    constructor(paramName : string, { parse } : { parse?: (arg: any, options : AsyncParam, req : Request) => any } = {}) {
        super();
        this.paramName = paramName;
        this.parse = parse;
    }
    
    resolve = (options: this, req : Request) => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(req.query[options.paramName]);
            }, 25);
        })
    }
}

describe('factories/param', () => {
    
    describe('ParamFactory', () => {
        let factory : ParamFactory;
    
        beforeEach(() => {
            factory = new ParamFactory();
        });
        
        describe(':getParameterFromMetadataAndRequest', () => {
            it('should return a promise', () => {
                const queryParam = new QueryParam('foo');
    
                expect(factory.getParameterFromMetadataAndRequest(queryParam, REQUEST)).to.be.instanceOf(Promise);
            });
            
            it('should resolve', async () => {
                const queryParam = new QueryParam('foo');
    
                expect(await factory.getParameterFromMetadataAndRequest(queryParam, REQUEST)).to.be.equal('1');
            });
    
            it('should resolve async', async () => {
                const queryParam = new AsyncParam('foo');
        
                expect(await factory.getParameterFromMetadataAndRequest(queryParam, REQUEST)).to.be.equal('1');
            });
            
            it('should resolve and parse', async () => {
                const queryParam = new QueryParam('foo', { parse: arg => parseInt(arg)});
    
                expect(await factory.getParameterFromMetadataAndRequest(queryParam, REQUEST)).to.be.equal(1);
            });
    
            it('should resolve and parse async', async () => {
                const queryParam = new AsyncParam('foo', { parse: arg => {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(parseInt(arg));
                        }, 25);
                    })
                }});
        
                expect(await factory.getParameterFromMetadataAndRequest(queryParam, REQUEST)).to.be.equal(1);
            });
            
            it('should provide arguments to resolve method', async () => {
                const queryParam = new QueryParam('foo');
                queryParam.resolve = sinon.spy(queryParam, 'resolve');
    
                await factory.getParameterFromMetadataAndRequest(queryParam, REQUEST);
                
                expect(queryParam.resolve).to.have.been.calledOnce.and.calledWith(queryParam, REQUEST);
            });
            
            it('should provide arguments to parse method', async () => {
                const queryParam = new QueryParam('foo', { parse: arg => parseInt(arg)});
                queryParam.parse = sinon.spy(queryParam, 'parse');
    
                await factory.getParameterFromMetadataAndRequest(queryParam, REQUEST);
                
                expect(queryParam.parse).to.have.been.calledOnce.and.calledWith('1', queryParam, REQUEST);
            });
            
            it('should fail when required field is missing', async () => {
                const queryParam = new QueryParam('foobar', { required: true });
                
                try {
                    await factory.getParameterFromMetadataAndRequest(queryParam, REQUEST);
                    expect.fail('should throw');
                } catch(e) {
                    expect(e.message).to.be.equal('QueryParam "foobar" required');
                }
            })
            
            it('should use validate function', async () => {
                const queryParam = new QueryParam('foo', { required: true, validate: value => value === '2' });
    
                try {
                    await factory.getParameterFromMetadataAndRequest(queryParam, REQUEST);
                    expect.fail('should throw');
                } catch(e) {
                    expect(e.message).to.be.equal('QueryParam "foo" invalid');
                }
            })
        });
    });
});
