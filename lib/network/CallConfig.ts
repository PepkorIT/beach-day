import {JasmineAsyncEnv} from "../utils/JasmineAsyncEnv";
import {IncomingMessage} from "http";
import * as _ from "lodash";
import * as path from "path";
import * as request from "request";
import {ExtendingObject} from "./ExtendingObject";
import {Request} from "request";
import {console} from "../reporter/BeachDayReporter";
import {TestUtils} from "../utils/TestUtils";
var urlJoin = require("url-join");

export interface ICallConfigParams {
    /** Only used when auto generating tests using a utility*/
    testName?:string;

    /**
     * Only used when auto generating tests using a utility.
     * Can be used to create xit() && fit() calls
     */
    testModifier?:string;

    /** API base url*/
    baseURL?:string;

    /** Timeout used for the http call, defaults to 15s */
    timeout?:number;

    /** Call endpoint*/
    endPoint?:string;

    /** Headers array*/
    headers?:any;

    /** Call HTTP method to use, defaults to POST*/
    method?:string;

    /** Amount of time to wait before executing the call*/
    waits?:number;

    /** Status code expected for the response of this call, defaults to 200*/
    status?:number;

    /**
     * Array of functions that will be executed before the config is run
     * Can be used to transform the config as a last stage
     */
    beforeFuncArr?:Array<IBeforeFunc>;

    /** Array of data objects / functions to be sent with the call, either a function that will be evoked to get the result or an object*/
    dataArr?:Array<IDataFunc | any>;

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
}

export interface IBeforeFunc{
    (env:JasmineAsyncEnv, call:CallConfig):void;
}
export interface IAssertFunc{
    (env:JasmineAsyncEnv, call:CallConfig, body:any, res:IncomingMessage):void;
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

export class CallConfig extends ExtendingObject<CallConfig, ICallConfigParams> implements ICallConfigParams{
    public testName:string;
    public testModifier:string;
    public baseURL:string;
    public timeout:number;
    public endPoint:string;
    public headers:any;
    public method:string;
    public waits:number;
    public status:number;
    public beforeFuncArr:Array<IBeforeFunc>;
    public dataArr:Array<IDataFunc | any>;
    public assertFuncArr:Array<IAssertFunc>;
    public obfuscateArr:Array<IObfuscateFunc>;
    public checkRequestSchemaFunc:ISchemaFunc;
    public checkResponseSchemaFunc:ISchemaFunc;
    public checkRequestSchema:boolean;
    public checkResponseSchema:boolean;

    constructor(params?:ICallConfigParams){
        // Set defaults if not already done
        super({method:"POST", status:200, timeout:15000}, params);
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
        if (this.dataArr == null){
            return null;
        }
        else{
            var result;
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
                if (!result){
                    result = dataResult;
                }
                else{
                    _.extend(result, dataResult);
                }
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
    public get fullURL():string {
        return this.baseURL != null && this.endPoint != null ? urlJoin(this.baseURL, this.endPoint) : null;
    }

    /**
     * Used to generated a new CallConfig instance
     * Properties are cascaded onto the new instance using
     * the current object, then the passed params
     */
    public extend(params:ICallConfigParams):CallConfig {
        var inst = new CallConfig();
        return super.extend(inst, params);
    }
}