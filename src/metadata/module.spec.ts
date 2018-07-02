import 'mocha';
import { expect } from 'chai';
import { Annotator } from '@neoskop/annotation-factory';
import { NemModule } from './module';

const MODULE_OPTIONS : NemModule = {
    providers: [
        { provide: 'FOOBAR', useValue: 'BAR' }
    ]
};

@NemModule(MODULE_OPTIONS)
class TestModule {

}

describe('metadata/module', () => {
    
    describe('NemModule', () => {
        
        it('should store metadata', () => {
            const annotations = Annotator.getCtorAnnotations(TestModule);
            
            expect(annotations).to.be.an('array').with.length(1);
            
            expect(annotations[ 0 ]).to.be.instanceOf(NemModule);
            expect(annotations[ 0 ]).to.be.eql(new NemModule(MODULE_OPTIONS));
        });
    });
});
