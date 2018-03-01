import { AbstractParam } from '../metadata/params';
import { Request } from 'express';
import { Injectable } from '@neoskop/injector';

@Injectable()
export class ParamFactory {
    async getParameterFromMetadataAndRequest(metadata : AbstractParam, request : Request) : Promise<any> {
        let value = await metadata.resolve(metadata, request);
        
        if(metadata.parse) {
            value = await metadata.parse(value, metadata, request);
        }
        
        return value;
    }
}
