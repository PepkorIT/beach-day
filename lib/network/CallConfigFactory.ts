import {JasmineAsyncEnv} from "../utils/JasmineAsyncEnv";
import {IncomingMessage} from "http";
import * as _ from "lodash";

export interface ICallConfigParams{
    // Call endpoint
    endPoint?:string;

    // Call HTTP method to use, defaults to POST
    method?:string;

    // Amount of time to wait before executing the call
    waits?:number;

    // Status code expected for the reponse of this call, defaults to 200
    status?:number;

    // Data to be sent with the call, either a function that will be envoked to get the result or an object
    data?:(env:JasmineAsyncEnv) => Object |Object;

    // Function to run a default set of assertions for this call
    // This is here to expand on the basic assertions made by this framework
    // This can be set on the factory defaults
    defaultAssertionsFunc?:(env:JasmineAsyncEnv, res:IncomingMessage, body?:Object) => void;

    // Function to run custom assertions for this call
    assertFunc?:(env:JasmineAsyncEnv, res:IncomingMessage, body?:Object) => void;

    // Obfuscation function, will be called before any logging is done
    // should be used to obfuscate any sensitive data from the log
    obfuscateFunc?:(call:CallConfig, env:JasmineAsyncEnv, err:Error, res?:IncomingMessage, body?:Object) => void;

    // Function that will be called if checkSchema or checkRequestSchema are set to true
    // It is up to the implementation to complete this method
    // It should return if the schema check passed or not
    checkSchemaFunc?:(call:CallConfig, data:Object, isRequest:boolean) => boolean;

    // If set to true checkSchemaFunc() will be called for the request data
    checkRequestSchema?:boolean;

    // If set to true checkSchemaFunc() will be called for the response data
    checkSchema?:boolean;
}

export class CallConfig implements ICallConfigParams{
    public endPoint:string;
    public method:string = "POST";
    public waits:number;
    public status:number = 200;
    public data:(env:JasmineAsyncEnv) => Object |Object;
    public defaultAssertionsFunc:(env:JasmineAsyncEnv, res:IncomingMessage, body?:Object) => void;
    public assertFunc:(env:JasmineAsyncEnv, res:IncomingMessage, body?:Object) => void;
    public obfuscateFunc:(call:CallConfig, env:JasmineAsyncEnv, err:Error, res?:IncomingMessage, body?:Object) => void;
    public checkSchemaFunc:(call:CallConfig, data:Object, isRequest:boolean) => boolean;
    public checkRequestSchema:boolean;
    public checkSchema:boolean;


    // Easy schema check proxy
    public checkSchemaImpl(call:CallConfig, data:Object, isRequest:boolean):boolean {
        if (isRequest && this.checkRequestSchema && this.checkSchemaFunc != null){
            return this.checkSchemaFunc(call, data, isRequest);
        }
        else if (!isRequest && this.checkSchema && this.checkSchemaFunc != null){
            return this.checkSchemaFunc(call, data, isRequest);
        }
        else{
            return true;
        }
    }

    // Get data proxy
    public getDataImpl(env:JasmineAsyncEnv):Object {
        if (typeof this.data == "function"){
            return this.data(env)
        }
        else if (typeof this.data == "object" || this.data == null){
            return this.data;
        }
        else{
            throw new Error("Unsupported data object type, we only support: null, object or function: " + this.data + JSON.stringify(this, null, 4));
        }
    }

    // Proxy for running all assertions
    public assertFuncImpl(env:JasmineAsyncEnv, res:IncomingMessage, body?:Object):void {
        if (this.defaultAssertionsFunc != null){
            this.defaultAssertionsFunc(env, res, body);
        }
        if (this.assertFunc != null){
            this.assertFunc(env, res, body);
        }
    }
}

export class CallConfigFactory {
    public defaultParams:ICallConfigParams;

    public instance(params:ICallConfigParams):ICallConfigParams {
        var p:CallConfig = new CallConfig();
        // Add the defaults then the passed values
        _.extend(p, this.defaultParams, params);
        return p;


        /*
        // Optional, if populated the error code will automatically be asserted
        assertErrorCode: "0013"
        */
    }

    public run(call:ICallConfigParams):void {

    }
}