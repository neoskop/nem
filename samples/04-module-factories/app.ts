import { nem } from '../../src/bootstrap';
import { RestModule } from './modules/rest/module';
import { NemModule } from '../../src/metadata/module';
import { viewDirectory } from '../../src/provider/view-directory';
import { IndexModule } from './modules/index/module';

const STAR_WARS_DATA = [
    {
        id: 'luke-skywalker',
        name: 'Luke Skywalker',
        profession: 'Jedi',
        home: 'Tatooine'
    },
    {
        id: 'han-solo',
        name: 'Han Solo',
        profession: 'Smuggler',
        home: '-'
    },
    {
        id: 'leia',
        name: 'Pricess Leia',
        profession: 'Pricess',
        home: 'Alderaan'
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
        IndexModule,
        [ '/star-wars', RestModule.forData(STAR_WARS_DATA) ],
        [ '/star-trek', RestModule.forData(STAR_TREK_DATA) ]
    ]
})
export class RootModule {

}


nem({
    providers: [
        viewDirectory('./04-module-factories/views')
    ]
}).bootstrap(RootModule).listen(8000);
