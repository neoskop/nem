import 'mocha';
import { expect } from 'chai';
import { Annotator } from './annotations';
import {
    DefaultsTypeAnnotationTest, EmptyTestClass,
    ParentAnnotation, PropWithParentAnnotation,
    PropWithParentAnnotationTest,
    SimpleParamAnnotationTest, SimplePropAnnotation,
    SimplePropAnnotationTest,
    SimpleTypeAnnotationTest,
    WithParentAnnotationTest
} from './annotations.fixture';

describe('utils/annotations', () => {
    describe('Annotator', () => {
        describe('static getTypeAnnotations()', () => {
            it('should return empty array if no annotations are present', () => {
                expect(Annotator.getCtorAnnotations(Function)).to.be.eql([]);
            })
        });
    
        describe('static getPropAnnotations()', () => {
            it('should return empty object/array if no annotations are present', () => {
                expect(Annotator.getPropAnnotations(EmptyTestClass)).to.be.eql({});
                expect(Annotator.getPropAnnotations(EmptyTestClass, 'foobar')).to.be.eql([]);
            });
        });
    
        describe('static getCtorParamAnnotations()', () => {
            it('should return empty array if no annotations are present', () => {
                expect(Annotator.getCtorParamAnnotations(EmptyTestClass)).to.be.eql([]);
            });
        });
    
        describe('static getParamAnnotations()', () => {
            it('should return empty array if no annotations are present', () => {
                expect(Annotator.getParamAnnotations(EmptyTestClass, 'foobar')).to.be.eql([]);
            });
        });
    
        describe('static makeDecorator()', () => {
            it('should store hydrated annotation', () => {
                const annotations = Annotator.getCtorAnnotations(SimpleTypeAnnotationTest);
            
                expect(annotations).to.be.an('array').with.length(1);
                expect(annotations[ 0 ].name).to.be.equal('SimpleTypeAnnotation');
                expect(annotations[ 0 ].foo).to.be.equal('bar');
            });
        
            it('should instrument props function', () => {
                const annotations = Annotator.getCtorAnnotations(DefaultsTypeAnnotationTest);
            
                expect(annotations).to.be.an('array').with.length(2);
                expect(annotations[ 0 ].name).to.be.equal('SimpleTypeAnnotation');
                expect(annotations[ 1 ].name).to.be.equal('DefaultsTypeAnnotation');
                expect(annotations[ 1 ].a).to.be.equal('A');
                expect(annotations[ 1 ].b).to.be.equal('b');
            });
        
            it('should create annotation with provided parent class', () => {
                const annotations = Annotator.getCtorAnnotations(WithParentAnnotationTest);
            
                expect(annotations).to.be.an('array').with.length(1);
                expect(annotations[ 0 ]).to.be.instanceOf(ParentAnnotation);
            })
        });
    
        describe('static makePropDecorator()', () => {
            it('should decorate property', () => {
                const annotations = Annotator.getPropAnnotations(SimplePropAnnotationTest, 'property');
            
                expect(annotations).to.be.an('array').with.length(1);
                expect(annotations[ 0 ].name).to.be.equal('SimplePropAnnotation');
            });
        
            it('should decorate method', () => {
                const annotations = Annotator.getPropAnnotations(SimplePropAnnotationTest, 'method');
            
                expect(annotations).to.be.an('array').with.length(1);
                expect(annotations[ 0 ].name).to.be.equal('SimplePropAnnotation');
            });
        
            it('should create annotation with provided parent class', () => {
                const annotations = Annotator.getPropAnnotations(PropWithParentAnnotationTest, 'property');
            
                expect(annotations).to.be.an('array').with.length(2);
                expect(annotations[ 1 ]).to.be.instanceOf(ParentAnnotation);
                expect(annotations[ 1 ]).to.be.instanceOf(PropWithParentAnnotation);
                expect(annotations[ 0 ]).to.be.instanceOf(SimplePropAnnotation);
            });
        });
    
        describe('static makeParamDecorator()', () => {
            it('should annotate ctor params', () => {
                const annotations = Annotator.getCtorParamAnnotations(SimpleParamAnnotationTest);
            
                expect(annotations).to.be.an('array').with.length(2);
                expect(annotations[ 0 ]).to.be.an('array').with.length(1);
                expect(annotations[ 0 ][ 0 ].name).to.be.equal('ParentParamAnnotation');
                expect(annotations[ 0 ][ 0 ]).to.be.instanceOf(ParentAnnotation);
                expect(annotations[ 1 ]).to.be.an('array').with.length(1);
                expect(annotations[ 1 ][ 0 ].name).to.be.equal('SimpleParamAnnotation');
            });
        
            it('should annotate method params', () => {
                const annotations = Annotator.getParamAnnotations(SimpleParamAnnotationTest, 'method');
            
                expect(annotations).to.be.an('array').with.length(2);
                expect(annotations[ 0 ]).to.be.an('array').with.length(1);
                expect(annotations[ 0 ][ 0 ].name).to.be.equal('SimpleParamAnnotation');
                expect(annotations[ 1 ]).to.be.an('array').with.length(1);
                expect(annotations[ 1 ][ 0 ].name).to.be.equal('SimpleParamAnnotation');
            });
        });
    });
});
