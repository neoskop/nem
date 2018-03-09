import { Annotator } from './annotations';

export class EmptyTestClass {
    foobar() {}
}

export const SimpleTypeAnnotation = Annotator.makeCtorDecorator('SimpleTypeAnnotation', (a = {}) => a);

@SimpleTypeAnnotation({ foo: 'bar' })
export class SimpleTypeAnnotationTest {}

export const DefaultsTypeAnnotation = Annotator.makeCtorDecorator('DefaultsTypeAnnotation', ({ a = 'a', b = 'b' } = {}) => ({ a, b }));

@DefaultsTypeAnnotation({ a: 'A' })
@SimpleTypeAnnotation()
export class DefaultsTypeAnnotationTest {}

export class ParentAnnotation {}
export const WithParentAnnotation = Annotator.makeCtorDecorator('WithParentAnnotation', (a = {}) => a, ParentAnnotation);

@WithParentAnnotation()
export class WithParentAnnotationTest {}


export const SimplePropAnnotation = Annotator.makePropDecorator('SimplePropAnnotation', (args : any) => {
    return { ...args };
});

export class SimplePropAnnotationTest {
    @SimplePropAnnotation()
    property : string = 'foobar';
    
    @SimplePropAnnotation()
    method() {}
}

export const PropWithParentAnnotation = Annotator.makePropDecorator('PropWithParentAnnotation', (a = {}) => a, ParentAnnotation);

export class PropWithParentAnnotationTest {
    @SimplePropAnnotation()
    @PropWithParentAnnotation()
    property : string = '';
}

export const SimpleParamAnnotation = Annotator.makeParamDecorator('SimpleParamAnnotation');

export const ParentParamAnnotation = Annotator.makeParamDecorator('ParentParamAnnotation', (a = {}) => a, ParentAnnotation);

export class SimpleParamAnnotationTest {
    constructor(@ParentParamAnnotation() public a : string, @SimpleParamAnnotation() public b : number) {}
    
    method(@SimpleParamAnnotation() _a : number, @SimpleParamAnnotation() _b : string) {}
}
