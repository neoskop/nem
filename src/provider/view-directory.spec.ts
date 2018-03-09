import 'mocha';
import { expect } from 'chai';
import { VIEWS } from '../tokens';
import { viewDirectory } from './view-directory';


describe('provider/view-directory', () => {
    describe('viewDirectory', () => {
        it('should return value provider', () => {
            expect(viewDirectory('./foobar')).to.be.eql({ provide: VIEWS, useValue: './foobar', multi: true });
        });
    });
});
