import 'mocha';
import { expect } from 'chai';
import { VIEW_PREFIX } from '../tokens';
import { viewPrefix } from './view-prefix';


describe('provider/view-prefix', () => {
    describe('viewPrefix', () => {
        it('should return value provider', () => {
            expect(viewPrefix('foobar')).to.be.eql({ provide: VIEW_PREFIX, useValue: 'foobar' });
        });
    });
});
