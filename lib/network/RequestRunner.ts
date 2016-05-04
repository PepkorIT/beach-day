import {JasmineAsyncEnv} from "../utils/JasmineAsyncEnv";
import {IncomingMessage} from "http";
import {console} from "../reporter/BeachDayReporter";
import {TestUtils} from "../utils/TestUtils";
import {CallConfig} from "./CallConfig";

import * as _ from "lodash";
import * as path from "path";
import * as request from "request";
import {ReporterAPI} from "../reporter/BeachDayReporter";
import ObjectUtils from "../utils/ObjectUtils";

export class RequestRunner {

    public static request = request;

    public static globalDefaults = new CallConfig();

    /**
     * Utility helper method for executing a request package
     * call using a CallConfig and an environment
     */
    public static run(call:CallConfig, env:JasmineAsyncEnv):void {

        call = RequestRunner.globalDefaults ? RequestRunner.globalDefaults.extend(call) : call;

        // Check required props
        var required = ["endPoint", "baseURL"];
        for (var i = 0; i < required.length; i++) {
            if (call[required[i]] == null){
                TestUtils.throwImplementationError(`${required[i]} is a required property to run your CallConfig: ${JSON.stringify(call, null, 4)}`);
                env.done();
                return;
            }
        }

        // Finally add some defaults if they don't exist
        if (call.method == null) call.method = "GET";


        // Run the before calls for any last transformations
        call.beforeProxy(env);

        // Header generation
        var headers = {};

        // Default headers to use json
        if (!RequestRunner.hasHeader(call.headers, "Content-Type")){
            headers["Content-Type"] = "application/json";
        }

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
                requestPassed   = call.checkSchemaImpl(env, data, true, null);
                if (call.dataSerialisationFunc != null){
                    sendBody    = call.dataSerialisationFunc(env, call, data);
                }
                else{
                    sendBody    = JSON.stringify(data);
                }
            }
        }

        if (!requestPassed){
            // Just complete the request if there are any errors
            env.done();
        }
        else{
            // Create the options from the options in the config then the derived data
            var options = <request.UriOptions> _.extend({}, call.requestOptions, <request.CoreOptions> {
                uri     : call.fullURL,
                method  : call.method.toUpperCase(),
                headers : headers,
                json    : false, // This is done manually so we can catch errors
                body    : sendBody,
                timeout : call.timeout
            });

            //console.log("running request() with:");
            //console.log(options);

            // Fetch the current spec ID from the reporter so we can
            // ensure the test is still running when we complete the request call
            var currSpecId = ReporterAPI.getCurrentSpecId();

            RequestRunner.request(options, (error:any, res:IncomingMessage, body:any) => {
                // We wrap this section as it is executed asynchronously and jasmine cannot catch it.
                // This should be removed when jasmine supports it: https://github.com/jasmine/jasmine/issues/529
                try{
                    // Ensure the same tests is still running
                    if (currSpecId != ReporterAPI.getCurrentSpecId()){
                        TestUtils.throwImplementationError("HTTP callback was executed after the test had been completed. Please check your timeouts to make sure the test is not timing out before the HTTP request.");
                        return;
                    }
                    if (error){
                        // Log out the request and response
                        //console.log("request() timeout with:");
                        //console.log(options);
                        RequestRunner.logRequestResponse(error, res, body, options);
                        TestUtils.throwExpectError("Expected HTTP call to be successful");
                    }
                    else{
                        // Try convert the json response
                        var parsePassed = true;
                        if (body && typeof body == "string"){
                            try{
                                if (call.dataDeSerialisationFunc != null){
                                    body = call.dataDeSerialisationFunc(env, call, body, res);
                                }
                                else{
                                    body = JSON.parse(body);
                                }
                            }
                            catch (e){
                                parsePassed = false;
                                TestUtils.throwExpectError("Expected JSON parsing from the server to pass");
                                console.log("Parsing Error: ");
                                console.log(e.message);
                                console.log("Original data from server:");
                                console.log(body);
                            }
                        }

                        // Set the body on the environment
                        env.currentBody = body;

                        // Run obfuscation
                        if (parsePassed) call.obfuscateFuncImpl(env, body, res);

                        // Log out the request and response
                        RequestRunner.logRequestResponse(error, res, body, options);

                        // Check schemas if setup
                        if (parsePassed) call.checkSchemaImpl(env, body, false, res);

                        // Run assertions
                        if (parsePassed) call.assertFuncImpl(env, body, res);
                    }

                    // Lastly call done()
                    env.done();
                }
                // Here we manually log an implementation error with the error stack.
                catch (e){
                    TestUtils.throwImplementationError(e.stack);
                    env.done();
                }
            });
        }
    }

    public static hasHeader(headers:any, name:string, value?:string):boolean {
        var hasHeader = false;
        if (headers != null){
            for (var propName in headers){
                if (propName.toLowerCase() == name.toLowerCase()){
                    if (value == null || (value != null && headers[propName].toLowerCase().indexOf(value) != -1)){
                        hasHeader = true;
                        break;
                    }
                }
            }
        }
        return hasHeader;
    }

    /**
     * Pretty logging for the reporter of the request and repsonse
     */
    public static logRequestResponse(error:any, res:any, body:any, options:any){
        if (res) {
            console.log("<strong>REQUEST</strong>");
            console.log("<hr class='short' />");
            console.log("URL: " + ObjectUtils.getProp(res, "request.uri.href"));
            console.log("Method: " + ObjectUtils.getProp(res, "res.request.method"));
            console.log("Request Headers:\n" + JSON.stringify(ObjectUtils.getProp(res, "request.headers"), null, 4));
            console.log("Body:\n" + ObjectUtils.getProp(res, "request.body"));
            console.log("");
            console.log("<strong>RESPONSE</strong>");
            console.log("<hr class='short' />");
            console.log("Status Code: " + res.statusCode);
            console.log("Response Headers:\n" + JSON.stringify(res.headers, null, 4));
            console.log("Body:\n" + JSON.stringify(body, null, 4));
            console.log("");
        }
        else{
            console.log("<strong>Request library error:</strong>");
            console.log(JSON.stringify(error, null, 4));

            console.log("<strong>REQUEST</strong>");
            console.log("<hr class='short' />");
            console.log("URL: " + options.uri);
            console.log("Method: " + options.method);
            console.log("Request Headers:\n" + JSON.stringify(options.headers, null, 4));
            if (options.body){
                var body = options.body;
                if (RequestRunner.hasHeader(options.headers, "content-type", "application/json")){
                    body = JSON.stringify(JSON.parse(body), null, 4);
                }
                console.log("Body:\n" + body);
            }
            console.log("Timeout: " + options.timeout);
            console.log("");
        }
    }
}