import {JasmineAsyncEnv} from "../utils/JasmineAsyncEnv";
import {IncomingMessage} from "http";
import {console} from "../reporter/BeachDayReporter";
import {TestUtils} from "../utils/TestUtils";
import {CallConfig} from "./CallConfig";

import * as _ from "lodash";
import * as path from "path";
import * as request from "request";

export class RequestRunner {

    public static globalDefaults = new CallConfig();

    /**
     * Utility helper method for executing a request package
     * call using a CallConfig and an environment
     */
    public static run(call:CallConfig, env:JasmineAsyncEnv):void {
        if (call.endPoint == null) throw new Error("endPoint is a required field for your CallConfig");
        if (call.baseURL == null) throw new Error("baseURL is a required field for your CallConfig");

        call = RequestRunner.globalDefaults.extend(call);

        // Run the before calls for any last transformations
        call.beforeProxy(env);

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
                requestPassed   = call.checkSchemaImpl(env, data, true, null);
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
                timeout : call.timeout
            };

            request(options, (error:any, response:IncomingMessage, body:any) => {
                if (error){
                    // Log out the request and response
                    RequestRunner.logRequestResponse(error, response, body, options);
                    TestUtils.throwExpectError("Expected HTTP call to be successful");
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
                            TestUtils.throwExpectError("Expected JSON parsing from the server to pass");
                            console.log("JSON Parsing Error: ");
                            console.log(e.message);
                            console.log("Original data from server:");
                            console.log(body);
                        }
                    }

                    // Set the body on the environment
                    env.currentBody = body;

                    // Run obfuscation
                    call.obfuscateFuncImpl(env, body, response);

                    // Log out the request and response
                    RequestRunner.logRequestResponse(error, response, body, options);

                    // Check schemas if setup
                    call.checkSchemaImpl(env, body, false, response);

                    // Run assertions
                    call.assertFuncImpl(env, body, response);

                    //expect(body).toNotHaveAnyStringNulls();
                }

                // Lastly call done()
                env.done();
            });
        }
    }

    /**
     * Pretty logging for the reporter of the request and repsonse
     */
    public static logRequestResponse(error:any, res:any, body:any, options:any){
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
            console.log("<strong>Request library error:</strong>");
            console.log(JSON.stringify(error, null, 4));

            console.log("<strong>REQUEST</strong>");
            console.log("<hr class='short' />");
            console.log("URL: " + options.uri);
            console.log("Method: " + options.method);
            console.log("Request Headers:\n" + JSON.stringify(options.headers, null, 4));
            if (options.body){
                var body = options.body;
                for (var propName in options.headers){
                    if (propName.toLowerCase() == "content-type" && options.headers[propName].toLowerCase().indexOf("application/json") != -1){
                        body = JSON.stringify(JSON.parse(body), null, 4);
                        break;
                    }
                }
                console.log("Body:\n" + body);
            }
            console.log("Timeout: " + options.timeout);
            console.log("");
        }
    }
}