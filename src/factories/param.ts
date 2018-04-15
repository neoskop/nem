import { AbstractParam, Err } from '../metadata/params';
import { Request } from 'express';
import { Injectable } from '@neoskop/injector';
import { BadRequestError } from '../errors/http';

@Injectable()
export class ParamFactory {
    
    hasErrorParam(params : AbstractParam[]) : boolean {
        return params.some(p => p instanceof Err);
    }
    
    async getParameterFromMetadataAndRequest(metadata : AbstractParam, request : Request) : Promise<any> {
        let value = await metadata.resolve(metadata, request);
        
        if(metadata.required && null == value) {
            throw new BadRequestError(`${(metadata as any).name} "${metadata.paramName}" required`);
        }
        
        if(metadata.parse) {
            value = await metadata.parse(value, metadata, request);
        }
        
        if(metadata.validate && !metadata.validate(value, metadata, request)) {
            throw new BadRequestError(`${(metadata as any).name} "${metadata.paramName}" invalid`)
        }
        
        return value;
    }
}
