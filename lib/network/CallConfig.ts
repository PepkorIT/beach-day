import {JasmineAsyncEnv} from "../utils/JasmineAsyncEnv";
import {IncomingMessage} from "http";
import * as _ from "lodash";
import {ExtendingObject} from "./ExtendingObject";
import {CoreOptions} from "request";
var urlJoin = require("url-join");

export interface ICallConfigParams {
    /** Only used when auto generating tests using a utility*/
    testName?:string;

    /**
     * Only used when auto generating tests using a utility.
     * Can be used to create xit() && fit() calls
     */
    testModifier?:string;

    /**
     * Only used then auto generating tests using a utility.
     * This can be used to set a timeout amount for your test
     */
    testTimeout?:number;

    /** API base url*/
    baseURL?:IDataFunc | string;

    /** Timeout used for the http call */
    timeout?:number;

    /** Call endpoint*/
    endPoint?:IDataFunc | string;

    /** Headers array*/
    headers?:any;

    /** Call HTTP method to use*/
    method?:string;

    /**
     * Array of functions that will be executed before the config is run
     * Can be used to transform the config as a last stage
     */
    beforeFuncArr?:Array<IBeforeFunc>;

    /** Array of data objects / functions to be sent with the call, either a function that will be evoked to get the result or an object*/
    dataArr?:Array<IDataFunc | any>;

    /** Function that can be used to serialise the data POSTED to the server */
    dataSerialisationFunc?:ISerialiseFunc;

    /** Function that can be used to deserialise the data returned from the server */
    dataDeSerialisationFunc?:IDeSerialiseFunc;

    /** List of functions to run custom assertions for this call*/
    assertFuncArr?:Array<IAssertFunc>;

    /**
     * Array of obfuscation functions, will be called before any logging is done
     * should be used to obfuscate any sensitive data from the log
     */
    obfuscateArr?:Array<IObfuscateFunc>;

    /**
     * Will be called if checkRequestSchema:true
     * It is up to the implementation to complete this method
     * It should return if the schema check passed or not
     */
    checkRequestSchemaFunc?:ISchemaFunc;

    /**
     * Will be called if checkResponseSchema:true
     * It is up to the implementation to complete this method
     * It should return if the schema check passed or not
     */
    checkResponseSchemaFunc?:ISchemaFunc;

    /** If set to true checkRequestSchemaFunc() will be called for the request data*/
    checkRequestSchema?:boolean;

    /** If set to true checkResponseSchemaFunc() will be called for the response data*/
    checkResponseSchema?:boolean;

    /**
     * Object of additional options sent to the request framework
     * Note: This will be the default options, then extended by the derived properties
     * from this cnfig object like data, method, etc
     */
    requestOptions?:CoreOptions;
}

export interface IBeforeFunc{
    (env:JasmineAsyncEnv, call:CallConfig):void;
}
export interface IAssertFunc{
    (env:JasmineAsyncEnv, call:CallConfig, body:any, res:IncomingMessage):void;
}
export interface ISerialiseFunc{
    (env:JasmineAsyncEnv, call:CallConfig, data:any):string;
}
export interface IDeSerialiseFunc{
    (env:JasmineAsyncEnv, call:CallConfig, body:any, res:IncomingMessage):string;
}
export interface IDataFunc{
    (env:JasmineAsyncEnv, call:CallConfig):any;
}
export interface IObfuscateFunc{
    (env:JasmineAsyncEnv, call:CallConfig, body:any, res:IncomingMessage):void;
}
export interface ISchemaFunc{
    (env:JasmineAsyncEnv, call:CallConfig, data:any, res:IncomingMessage):boolean;
}

export class CallConfig extends ExtendingObject implements ICallConfigParams{
    public testName:string;
    public testModifier:string;
    public testTimeout:number;
    public baseURL:IDataFunc | string;
    public timeout:number;
    public endPoint:IDataFunc | string;
    public headers:any;
    public method:string;
    public beforeFuncArr:Array<IBeforeFunc>;
    public dataArr:Array<IDataFunc | any>;
    public dataSerialisationFunc:ISerialiseFunc;
    public dataDeSerialisationFunc:IDeSerialiseFunc;
    public assertFuncArr:Array<IAssertFunc>;
    public obfuscateArr:Array<IObfuscateFunc>;
    public checkRequestSchemaFunc:ISchemaFunc;
    public checkResponseSchemaFunc:ISchemaFunc;
    public checkRequestSchema:boolean;
    public checkResponseSchema:boolean;
    public requestOptions:CoreOptions;

    constructor(params?:ICallConfigParams){
        super();
        // Set defaults if not already done
        if (params) _.assignWith(this, params, this.extender);
    }

    /**
     * Proxy for executing the beforeFuncArr calls
     */
    public beforeProxy(env:JasmineAsyncEnv):void {
        if (this.beforeFuncArr){
            for (var i = 0; i < this.beforeFuncArr.length; i++) {
                this.beforeFuncArr[i](env, this);
            }
        }
    }

    /**
     * Proxy for executing the dataArr calls
     */
    public getDataImpl(env:JasmineAsyncEnv):any {
        if (this.dataArr == null || this.dataArr.length == 0){
            return null;
        }
        else{
            var result = {};
            for (var i = 0; i < this.dataArr.length; i++) {
                var arrItem = this.dataArr[i];
                var dataResult;
                if (typeof arrItem == "function"){
                    dataResult = arrItem(env);
                }
                else if (typeof arrItem == "object" || arrItem == null){
                    dataResult = arrItem;
                }
                else{
                    throw new Error("Unsupported data object type, we only support: null, object or function: " + arrItem + JSON.stringify(this, null, 4));
                }
                _.extend(result, dataResult);
            }
            return result;
        }
    }

    /**
     * Proxy for running all assertions
     */
    public assertFuncImpl(env:JasmineAsyncEnv, body:any, res:IncomingMessage):void {
        if (this.assertFuncArr){
            for (var i = 0; i < this.assertFuncArr.length; i++) {
                var func = this.assertFuncArr[i];
                func(env, this, body, res);
            }
        }
    }

    /**
     * Proxy for all obfuscations
     */
    public obfuscateFuncImpl(env:JasmineAsyncEnv, body:any, res:IncomingMessage){
        if (this.obfuscateArr){
            for (var i = 0; i < this.obfuscateArr.length; i++) {
                var func = this.obfuscateArr[i];
                func(env, this, body, res);
            }
        }
    }

    /**
     * Proxy for running schema checks
     */
    public checkSchemaImpl(env:JasmineAsyncEnv, data:any, isRequest:boolean, res:IncomingMessage):boolean {
        if (isRequest && this.checkRequestSchema && this.checkRequestSchemaFunc != null){
            return this.checkRequestSchemaFunc(env, this, data, null);
        }
        else if (!isRequest && this.checkResponseSchema && this.checkResponseSchemaFunc != null){
            return this.checkResponseSchemaFunc(env, this, data, res);
        }
        else{
            return true;
        }
    }

    /**
     * Returns the full api url for running the call
     */
    public getFullURL(env:JasmineAsyncEnv):string {
        if (this.baseURL != null && this.endPoint != null){
            var valueFromMulti = (source:any):string => { return typeof source == "function" ? source(env, this) : source; };
            return urlJoin(valueFromMulti(this.baseURL), valueFromMulti(this.endPoint));
        }
        return null;
    }

    /**
     * Used to generated a new CallConfig instance
     * Properties are deeply cascaded onto the new instance using
     * the current object, then the passed params
     * By deeply cascaded we mean, properties that are objects are extended, properties that are arrays are joined
     */
    public extend(params:ICallConfigParams):CallConfig {
        return <CallConfig> _.assignWith(new CallConfig(), this, params, this.extender);
    }
}