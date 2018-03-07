import { Get, JsonController, OnUndefined } from '../../../../../src/metadata/controller';
import { Inject } from '@neoskop/injector';
import { DATA } from '../module';
import { forwardRef } from '@angular/core';
import { Param } from '../../../../../src/metadata/params';


@JsonController()
export class RestController {
    constructor(@Inject(forwardRef(() => DATA)) protected data : { id: string }[]) {}
    
    @Get('/')
    index() {
        return this.data;
    }
    
    @Get('/:id')
    @OnUndefined(404)
    one(@Param('id') id : string) {
        return this.data.find(d => d.id === id);
    }
}
