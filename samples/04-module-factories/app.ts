import { nem } from '../../src/bootstrap';
import { RestModule } from './modules/rest/module';
import { NemModule } from '../../src/metadata/module';

const STAR_WARS_DATA = [
    {
        id: 'luke-skywalker',
        name: 'Luke Skywalker',
        home: 'Tatooine'
    },
    {
        id: 'han-solo',
        name: 'Han Solo',
        home: '-'
    }
];

const STAR_TREK_DATA = [
    {
        id: 'picard',
        rank: 'Captain',
        name: 'Jean Luc Picard',
        home: 'Earth'
    },
    {
        id: 'worf',
        rank: 'Commander',
        name: 'Worf',
        home: 'Qo\'noS'
    }
]

@NemModule({
    modules: [
        [ '/star-wars', RestModule.forData(STAR_WARS_DATA) ],
        [ '/star-trek', RestModule.forData(STAR_TREK_DATA) ]
    ]
})
export class RootModule {

}


nem().bootstrap(RootModule).listen(8000);
