import 'mocha';
import { expect } from 'chai';
import { Result } from './result';
import { Locals, View } from './controller';


describe('metadata/result', () => {
    describe('Result', () => {
        
        for(const [ desc, factory ] of [
            [ 'as class', (...args : any[]) => new (Result as any)(...args) ],
            [ 'as function', Result ]
        ] as [string,any][]) {
            describe(desc, () => {
                it('should create', () => {
                    const res = factory();
        
                    expect(res).to.be.instanceOf(Result);
                });
    
                it('should initialize with empty args and no result', () => {
                    const res = factory();
        
                    expect(res.args).to.be.an('array').with.length(0);
                    expect(res.hasOwnProperty('result')).to.be.true;
                });
                
                it('should add args on init', () => {
                    const locals = new Locals({});
                    const template = new View('tpl');

                    const res = factory([locals, template]);

                    expect(res.args).to.be.an('array').with.length(2);
                    expect(res.args[0]).to.be.equal(locals);
                    expect(res.args[1]).to.be.equal(template);
                    expect(res.hasOwnProperty('result')).to.be.true;
                });
                
                it('should add result on init', () => {
                    const result = {};
                    const res = factory(result);
                    
                    expect(res.args).to.be.an('array').with.length(0);
                    expect(res.hasOwnProperty('result')).to.be.true;
                    expect(res.result).to.be.equal(result);
                });
                
                it('should add args and result', () => {
                    const locals = new Locals({});
                    const template = new View('tpl');
                    const result = {};
                    
                    const res = factory([locals, template], result);
                    
                    expect(res.args).to.be.an('array').with.length(2);
                    expect(res.args[0]).to.be.equal(locals);
                    expect(res.args[1]).to.be.equal(template);
                    expect(res.hasOwnProperty('result')).to.be.true;
                    expect(res.result).to.be.equal(result);
                });
                
                it('should throw on invalid args', () => {
                    expect(() => {
                        factory([ 'foobar' ], {});
                    }).to.throw();
                });
            })
        }
        
        describe(':ensure', () => {
            it('should return arg when arg is a Result', () => {
                const res = new Result('foobar');
                
                expect(Result.ensure(res)).to.be.equal(res);
            });
            
            it('should create Result when arg is not a Result', () => {
                const res = Result.ensure('foobar');
                
                expect(res).to.be.instanceOf(Result);
                expect(res.args).to.be.an('array').with.length(0);
                expect(res.result).to.be.equal('foobar');
            })
        })
    });
    
});
