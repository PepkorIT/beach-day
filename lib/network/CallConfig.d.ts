import { JasmineAsyncEnv } from '../utils/JasmineAsyncEnv';
import { ExtendingObject } from './ExtendingObject';
import { CoreOptions, RequestResponse } from 'request';
import { IRequestResponse } from './IRequestResponse';
export interface ICallConfigParams {
    /** Only used when auto generating tests using a utility*/
    testName?: string;
    /**
     * Only used when auto generating tests using a utility.
     * Can be used to create xit() && fit() calls
     */
    testModifier?: string;
    /**
     * Only used then auto generating tests using a utility.
     * This can be used to set a timeout amount for your test
     */
    testTimeout?: number;
    /** API base url*/
    baseURL?: IDataFunc | string;
    /** Timeout used for the http call */
    timeout?: number;
    /** Call endpoint*/
    endPoint?: IDataFunc | string;
    /**
     * Headers object
     * @deprecated since version 1.1.0 please use headersArr
     */
    headers?: any;
    /**
     * Array of header objects / functions to be sent with the call, either a function that will be evoked to get the result or an object
     */
    headersArr?: Array<IDataFunc | any>;
    /** Call HTTP method to use*/
    method?: string;
    /**
     * Array of functions that will be executed before the config is run
     * Can be used to transform the config as a last stage
     */
    beforeFuncArr?: Array<IBeforeFunc>;
    /** Array of data objects / functions to be sent with the call, either a function that will be evoked to get the result or an object*/
    dataArr?: Array<IDataFunc | any>;
    /** Function that can be used to serialise the data POSTED to the server */
    dataSerialisationFunc?: ISerialiseFunc;
    /** Function that can be used to deserialise the data returned from the server */
    dataDeSerialisationFunc?: IDeSerialiseFunc;
    /** List of functions to run custom assertions for this call*/
    assertFuncArr?: Array<IAssertFunc>;
    /**
     * Array of obfuscation functions, will be called before any logging is done
     * should be used to obfuscate any sensitive data from the log
     */
    obfuscateArr?: Array<IObfuscateFunc>;
    /**
     * Will be called if checkRequestSchema:true
     * It is up to the implementation to complete this method
     * It should return if the schema check passed or not
     */
    checkRequestSchemaFunc?: ISchemaFunc;
    /**
     * Will be called if checkResponseSchema:true
     * It is up to the implementation to complete this method
     * It should return if the schema check passed or not
     */
    checkResponseSchemaFunc?: ISchemaFunc;
    /** If set to true checkRequestSchemaFunc() will be called for the request data*/
    checkRequestSchema?: boolean;
    /** If set to true checkResponseSchemaFunc() will be called for the response data*/
    checkResponseSchema?: boolean;
    /**
     * Object of additional options sent to the request framework
     * Note: This will be the default options, then extended by the derived properties
     * from this cnfig object like data, method, etc
     */
    requestOptions?: CoreOptions;
    /**
     * Callback that is executed directly after the request is made with the raw request options.
     **/
    requestCallback?: IRequestCallbackHook;
    /**
     * If set to true, errors returned from the request framework will not mark a test as failed.
     * These include things like timeouts, SSL errors, etc.
     */
    allowHTTPErrors?: boolean | IAllowErrorFunc;
}
export interface IRequestCallbackHook {
    (error: any, response: RequestResponse, body: any): Promise<IRequestCallbackResponse>;
}
export interface IRequestCallbackResponse {
    error: any;
    response: RequestResponse;
    body: any;
}
export interface IBeforeFunc {
    (env: JasmineAsyncEnv, call: CallConfig): void;
}
export interface IAssertFunc {
    (env: JasmineAsyncEnv, call: CallConfig, body: any, res: IRequestResponse): void;
}
export interface ISerialiseFunc {
    (env: JasmineAsyncEnv, call: CallConfig, data: any): string;
}
export interface IDeSerialiseFunc {
    (env: JasmineAsyncEnv, call: CallConfig, body: any, res: IRequestResponse): string;
}
export interface IDataFunc {
    (env: JasmineAsyncEnv, call: CallConfig): any;
}
export interface IObfuscateFunc {
    (env: JasmineAsyncEnv, call: CallConfig, body: any, res: IRequestResponse): void;
}
export interface ISchemaFunc {
    (env: JasmineAsyncEnv, call: CallConfig, data: any, res: IRequestResponse): boolean;
}
export interface IAllowErrorFunc {
    (error: any, env: JasmineAsyncEnv, call: CallConfig, res: IRequestResponse): boolean;
}
export declare class CallConfig extends ExtendingObject implements ICallConfigParams {
    testName: string;
    testModifier: string;
    testTimeout: number;
    baseURL: IDataFunc | string;
    timeout: number;
    endPoint: IDataFunc | string;
    headers: any;
    headersArr?: Array<IDataFunc | any>;
    method: string;
    beforeFuncArr: Array<IBeforeFunc>;
    dataArr: Array<IDataFunc | any>;
    dataSerialisationFunc: ISerialiseFunc;
    dataDeSerialisationFunc: IDeSerialiseFunc;
    assertFuncArr: Array<IAssertFunc>;
    obfuscateArr: Array<IObfuscateFunc>;
    checkRequestSchemaFunc: ISchemaFunc;
    checkResponseSchemaFunc: ISchemaFunc;
    checkRequestSchema: boolean;
    checkResponseSchema: boolean;
    requestOptions: CoreOptions;
    requestCallback: IRequestCallbackHook;
    allowHTTPErrors: boolean | IAllowErrorFunc;
    constructor(params?: ICallConfigParams);
    /**
     * Proxy for executing the beforeFuncArr calls
     */
    beforeProxy(env: JasmineAsyncEnv): void;
    /**
     * Proxy for executing the dataArr calls
     */
    getDataImpl(env: JasmineAsyncEnv): any;
    /**
     * Proxy for executing the headersArr calls
     */
    getHeadersImpl(env: JasmineAsyncEnv): any;
    /**
     * Proxy for running all assertions
     */
    assertFuncImpl(env: JasmineAsyncEnv, body: any, res: IRequestResponse): void;
    /**
     * Proxy for all obfuscations
     */
    obfuscateFuncImpl(env: JasmineAsyncEnv, body: any, res: IRequestResponse): void;
    /**
     * Proxy for running schema checks
     */
    checkSchemaImpl(env: JasmineAsyncEnv, data: any, isRequest: boolean, res: IRequestResponse): boolean;
    /**
     * Returns the full api url for running the call
     */
    getFullURL(env: JasmineAsyncEnv): string;
    /**
     * Used to generated a new CallConfig instance
     * Properties are deeply cascaded onto the new instance using
     * the current object, then the passed params
     * By deeply cascaded we mean, properties that are objects are extended, properties that are arrays are joined
     */
    extend(params: ICallConfigParams): CallConfig;
}
