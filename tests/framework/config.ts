import {CallConfig, IRequestCallbackResponse} from '../../lib/network/CallConfig';
import {RequestResponse} from 'request';

const config           = new CallConfig();
config.requestCallback = (error:any, response:RequestResponse, body:any):Promise<IRequestCallbackResponse> => {
    return new Promise<IRequestCallbackResponse>(() => {
    });
};
