import {JasmineAsyncEnv} from "../utils/JasmineAsyncEnv";
import {IncomingMessage} from "http";
import * as _ from "lodash";
import * as path from "path";
import * as request from "request";
import {ExtendingObject} from "./ExtendingObject";
import {Request} from "request";
import {throwExpectError} from "../utils/TestUtils";
import {console} from "../reporter/BeachDayReporter";
var urlJoin = require("url-join");

export interface ICallConfigParams{
    // API base url
    baseURL?:string;

    // Call endpoint
    endPoint?:string;

    // Headers array
    headers?:any;

    // Call HTTP method to use, defaults to POST
    method?:string;

    // Amount of time to wait before executing the call
    waits?:number;

    // Status code expected for the response of this call, defaults to 200
    status?:number;

    // Array of data objects / functions to be sent with the call, either a function that will be evoked to get the result or an object
    dataArr?:Array<IDataFunc | any>;

    // List of functions to run custom assertions for this call
    assertFuncArr?:Array<IAssertFunc>;

    // Array of obfuscation functions, will be called before any logging is done
    // should be used to obfuscate any sensitive data from the log
    obfuscateArr?:Array<IObfuscateFunc>;

    // Will be called if checkRequestSchema:true
    // It is up to the implementation to complete this method
    // It should return if the schema check passed or not
    checkRequestSchemaFunc?:(call:CallConfig, data:any) => boolean;

    // Will be called if checkResponseSchema:true
    // It is up to the implementation to complete this method
    // It should return if the schema check passed or not
    checkResponseSchemaFunc?:(call:CallConfig, data:any) => boolean;

    // If set to true checkRequestSchemaFunc() will be called for the request data
    checkRequestSchema?:boolean;

    // If set to true checkResponseSchemaFunc() will be called for the response data
    checkResponseSchema?:boolean;
}

export interface IAssertFunc{
    (env:JasmineAsyncEnv, res:IncomingMessage, body?:any):void;
}
export interface IDataFunc{
    (env:JasmineAsyncEnv):any;
}
export interface IObfuscateFunc{
    (call:CallConfig, env:JasmineAsyncEnv, res?:IncomingMessage, body?:any):void;
}

export class CallConfig extends ExtendingObject<CallConfig, ICallConfigParams> implements ICallConfigParams{
    public baseURL:string;
    public endPoint:string;
    public headers:any;
    public method:string = "post";
    public waits:number;
    public status:number = 200;
    public dataArr:Array<IDataFunc | any>;
    public assertFuncArr:Array<IAssertFunc>;
    public obfuscateArr:Array<IObfuscateFunc>;
    public checkRequestSchemaFunc:(call:CallConfig, data:any) => boolean;
    public checkResponseSchemaFunc:(call:CallConfig, data:any) => boolean;
    public checkRequestSchema:boolean;
    public checkResponseSchema:boolean;

    // Get data proxy
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

    // Proxy for running all assertions
    public assertFuncImpl(env:JasmineAsyncEnv, res:IncomingMessage, body?:any):void {
        if (this.assertFuncArr){
            for (var i = 0; i < this.assertFuncArr.length; i++) {
                var func = this.assertFuncArr[i];
                func(env, res, body);
            }
        }
    }

    // Proxy for all obfuscations
    public obfuscateFuncImpl(env:JasmineAsyncEnv, res:IncomingMessage, body?:any){
        if (this.obfuscateArr){
            for (var i = 0; i < this.obfuscateArr.length; i++) {
                var func = this.obfuscateArr[i];
                func(this, env, res, body);
            }
        }
    }


    // Easy schema check proxy
    public checkSchemaImpl(data:any, isRequest:boolean):boolean {
        if (isRequest && this.checkRequestSchema && this.checkRequestSchemaFunc != null){
            return this.checkRequestSchemaFunc(this, data);
        }
        else if (!isRequest && this.checkResponseSchema && this.checkResponseSchemaFunc != null){
            return this.checkResponseSchemaFunc(this, data);
        }
        else{
            return true;
        }
    }

    public get fullURL():string {
        return this.baseURL != null && this.endPoint != null ? urlJoin(this.baseURL, this.endPoint) : null;
    }

    public extend(params:ICallConfigParams):CallConfig {
        return super.extend(new CallConfig(), params);
    }
}




export class CallRunner {
    public defaultConfig:CallConfig;
    public timeout:number = 15 * 1000;


    public run(call:CallConfig, env:JasmineAsyncEnv):void {
        if (call.endPoint == null) throw new Error("endPoint is a required field for your CallConfig");
        if (call.baseURL == null) throw new Error("baseURL is a required field for your CallConfig");

        // Default header to use json
        var headers = {
            "Content-Type": "application/json"
        };
        if (call.headers) {
            for (var propName in call.headers){
                if (!headers.hasOwnProperty(propName.toLowerCase())){
                    headers[propName] = call.headers[propName];
                }
            }
        }

        var requestPassed = true;

        var sendBody;
        if (call.method != "GET"){
            var data = call.getDataImpl(env);
            if (data) {
                requestPassed   = call.checkSchemaImpl(data, true);
                sendBody        = JSON.stringify(data);
            }
        }

        if (!requestPassed){
            // Just complete the request if there are any errors
            env.done();
        }
        else{
            var options = {
                uri     : call.fullURL,
                method  : call.method.toUpperCase(),
                headers : headers,
                json    : false, // This is done manually so we can catch errors
                body    : sendBody,
                timeout : this.timeout
            };

            request(options, (error:any, response:IncomingMessage, body:any) => {
                if (error){
                    // Log out the request and response
                    this.logRequestResponse(error, response, body);
                    throwExpectError("Expected HTTP call to be successful");
                    console.log("HTTP call made with parameters: ", options);
                }
                else{
                    // Assert the status
                    expect(response.statusCode).statusCodeToBe(call.status);

                    // Try convert the json response
                    if (body){
                        try{
                            body = JSON.parse(body);
                        }
                        catch (e){
                            throwExpectError("Expected JSON parsing from the server to pass");
                            console.log("JSON Parsing Error: ");
                            console.log(e.message);
                            console.log("Original data from server:");
                            console.log(body);
                        }
                    }

                    // Set the body on the environment
                    env.currentBody = body;

                    // Run obfuscation
                    call.obfuscateFuncImpl(env, response, body);

                    // Log out the request and response
                    this.logRequestResponse(error, response, body);

                    // Check schemas if setup
                    call.checkSchemaImpl(body, false);

                    // Run assertions
                    call.assertFuncImpl(env, response, body);

                    //expect(body).toNotHaveAnyStringNulls();
                }

                // Lastly call done()
                env.done();
            });
        }
    }

    public logRequestResponse(error:any, res:any, body:any){
        if (res) {
            console.log("<strong>REQUEST</strong>");
            console.log("<hr class='short' />");
            console.log("URL: " + res.request.uri.href);
            console.log("Method: " + res.request.method);
            console.log("Request Headers:\n" + JSON.stringify(res.request.headers, null, 4));
            console.log("Body:\n" + res.request.body);
            console.log("");
            console.log("<strong>RESPONSE</strong>");
            console.log("<hr class='short' />");
            console.log("Status Code: " + res.statusCode);
            console.log("Response Headers:\n" + JSON.stringify(res.headers, null, 4));
            console.log("Body:\n" + JSON.stringify(body, null, 4));
            console.log("");
        }
        else{
            console.log("HTTP Error => " + JSON.stringify(error, null, 4));
        }
    }
}