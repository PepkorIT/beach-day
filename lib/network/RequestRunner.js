"use strict";
var BeachDayReporter_1 = require("../reporter/BeachDayReporter");
var TestUtils_1 = require("../utils/TestUtils");
var CallConfig_1 = require("./CallConfig");
var _ = require("lodash");
var request = require("request");
var URL = require("url");
var ObjectUtils_1 = require("../utils/ObjectUtils");
var escapeHtml = require("escape-html");
var RequestRunner = (function () {
    function RequestRunner() {
    }
    /**
     * Utility helper method for executing a request package
     * call using a CallConfig and an environment
     */
    RequestRunner.run = function (call, env) {
        call = RequestRunner.globalDefaults ? RequestRunner.globalDefaults.extend(call) : call;
        // Check required props
        var required = ["endPoint", "baseURL"];
        for (var i = 0; i < required.length; i++) {
            if (call[required[i]] == null) {
                TestUtils_1.TestUtils.throwImplementationError(required[i] + " is a required property to run your CallConfig: " + JSON.stringify(call, null, 4));
                env.done();
                return;
            }
        }
        // Finally add some defaults if they don't exist
        if (call.method == null)
            call.method = "GET";
        // Run the before calls for any last transformations
        call.beforeProxy(env);
        // Header generation
        var headers = {};
        // Default headers to use json
        if (!RequestRunner.hasHeader(call.headers, "content-type")) {
            headers["content-type"] = "application/json";
        }
        if (call.headers) {
            for (var propName in call.headers) {
                if (!headers.hasOwnProperty(propName.toLowerCase())) {
                    headers[propName] = call.headers[propName];
                }
            }
        }
        var requestPassed = true;
        var sendBody;
        if (call.method != "GET") {
            var data = call.getDataImpl(env);
            if (data) {
                requestPassed = call.checkSchemaImpl(env, data, true, null);
                if (call.dataSerialisationFunc != null) {
                    sendBody = call.dataSerialisationFunc(env, call, data);
                }
                else {
                    sendBody = JSON.stringify(data);
                }
            }
        }
        if (!requestPassed) {
            // Just complete the request if there are any errors
            env.done();
        }
        else {
            // Create the options from the options in the config then the derived data
            var options = _.extend({}, call.requestOptions, {
                uri: call.getFullURL(env),
                method: call.method.toUpperCase(),
                headers: headers,
                json: false,
                body: sendBody,
                timeout: call.timeout
            });
            //console.log("running request() with:");
            //console.log(options);
            // Fetch the current spec ID from the reporter so we can
            // ensure the test is still running when we complete the request call
            var currSpecId = BeachDayReporter_1.ReporterAPI.getCurrentSpecId();
            RequestRunner.request(options, function (error, sourceRes, body) {
                var res = sourceRes;
                // We wrap this section as it is executed asynchronously and jasmine cannot catch it.
                // This should be removed when jasmine supports it: https://github.com/jasmine/jasmine/issues/529
                try {
                    // Ensure the same tests is still running
                    if (currSpecId != BeachDayReporter_1.ReporterAPI.getCurrentSpecId()) {
                        TestUtils_1.TestUtils.throwImplementationError("HTTP callback was executed after the test had been completed. Please check your timeouts to make sure the test is not timing out before the HTTP request.");
                        return;
                    }
                    if (error) {
                        // Log out the request and response
                        // Generate a response object that is partially populated with only the request information
                        // We do this so the data for the request resides in the same place, always
                        var fakeResponse = {
                            headers: null,
                            statusCode: 0,
                            body: null,
                            request: {
                                uri: URL.parse(options.uri),
                                method: options["method"],
                                headers: options["headers"],
                                body: options["body"]
                            }
                        };
                        call.obfuscateFuncImpl(env, null, fakeResponse);
                        RequestRunner.logRequestResponse(error, fakeResponse, body, options, true, true);
                        if (call.allowHTTPErrors != null) {
                            if (call.allowHTTPErrors === true) {
                            }
                            else if (typeof call.allowHTTPErrors == "function" && !call.allowHTTPErrors(error, env, call, fakeResponse)) {
                                TestUtils_1.TestUtils.throwExpectError("Expected HTTP call to be successful");
                            }
                        }
                        else {
                            TestUtils_1.TestUtils.throwExpectError("Expected HTTP call to be successful");
                        }
                    }
                    else {
                        // Try convert the response using the dataDeSerialisationFunc or JSON.parse()
                        var parsePassed = true;
                        if (body && typeof body == "string") {
                            try {
                                if (call.dataDeSerialisationFunc != null) {
                                    body = call.dataDeSerialisationFunc(env, call, body, res);
                                }
                                else {
                                    body = JSON.parse(body);
                                }
                            }
                            catch (e) {
                                parsePassed = false;
                                TestUtils_1.TestUtils.throwExpectError("Expected JSON parsing from the server to pass");
                                BeachDayReporter_1.console.log("Parsing Error: ");
                                BeachDayReporter_1.console.log(e.message);
                                BeachDayReporter_1.console.log("Original data from server:");
                                // Escape before logging it as this will form part of the report
                                BeachDayReporter_1.console.log(escapeHtml(body));
                            }
                        }
                        // Set the body on the environment
                        env.currentBody = body;
                        // Run obfuscation
                        if (parsePassed)
                            call.obfuscateFuncImpl(env, body, res);
                        // Log out the request and response
                        RequestRunner.logRequestResponse(error, res, body, options, false, parsePassed);
                        // Check schemas if setup
                        if (parsePassed)
                            call.checkSchemaImpl(env, body, false, res);
                        // Run assertions
                        if (parsePassed)
                            call.assertFuncImpl(env, body, res);
                    }
                    // Lastly call done()
                    env.done();
                }
                // Here we manually log an implementation error with the error stack.
                catch (e) {
                    TestUtils_1.TestUtils.throwImplementationError(e.stack);
                    env.done();
                }
            });
        }
    };
    RequestRunner.hasHeader = function (headers, name, value) {
        var hasHeader = false;
        if (headers != null) {
            for (var propName in headers) {
                if (propName.toLowerCase() == name.toLowerCase()) {
                    if (value == null || (value != null && headers[propName].toLowerCase().indexOf(value) != -1)) {
                        hasHeader = true;
                        break;
                    }
                }
            }
        }
        return hasHeader;
    };
    /**
     * Pretty logging for the reporter of the request and repsonse
     */
    RequestRunner.logRequestResponse = function (error, res, parsedResponseBody, options, isError, parsePassed) {
        var requestBody = ObjectUtils_1.default.getProp(res, "request.body");
        var requestHeaders = ObjectUtils_1.default.getProp(res, "request.headers");
        // Pretty print the request response if we deem it to be of type JSON
        if (requestHeaders && requestBody && RequestRunner.hasHeader(requestHeaders, "content-type", "application/json")) {
            requestBody = JSON.stringify(JSON.parse(requestBody), null, 4);
        }
        if (requestBody == null)
            requestBody = "";
        // Pretty print the response body only if it is already an object
        if (parsedResponseBody && typeof parsedResponseBody == "object") {
            parsedResponseBody = JSON.stringify(parsedResponseBody, null, 4);
        }
        // body is in fact not parsed and must be escaped in case
        if (parsePassed == false) {
            parsedResponseBody = escapeHtml(parsedResponseBody);
        }
        if (!isError) {
            BeachDayReporter_1.console.log("<strong>REQUEST</strong>");
            BeachDayReporter_1.console.log("<hr class='short' />");
            BeachDayReporter_1.console.log("URL: " + ObjectUtils_1.default.getProp(res, "request.uri.href"));
            BeachDayReporter_1.console.log("Method: " + ObjectUtils_1.default.getProp(res, "request.method"));
            BeachDayReporter_1.console.log("Request Headers:\n" + JSON.stringify(requestHeaders, null, 4));
            BeachDayReporter_1.console.log("Body:\n" + requestBody);
            BeachDayReporter_1.console.log("");
            BeachDayReporter_1.console.log("<strong>RESPONSE</strong>");
            BeachDayReporter_1.console.log("<hr class='short' />");
            BeachDayReporter_1.console.log("Status Code: " + res.statusCode);
            BeachDayReporter_1.console.log("Response Headers:\n" + JSON.stringify(res.headers, null, 4));
            BeachDayReporter_1.console.log("Body:\n" + parsedResponseBody);
            BeachDayReporter_1.console.log("");
        }
        else {
            BeachDayReporter_1.console.log("<strong>Request library error:</strong>");
            BeachDayReporter_1.console.log(JSON.stringify(error, null, 4));
            BeachDayReporter_1.console.log("<strong>REQUEST</strong>");
            BeachDayReporter_1.console.log("<hr class='short' />");
            BeachDayReporter_1.console.log("URL: " + ObjectUtils_1.default.getProp(res, "request.uri.href"));
            BeachDayReporter_1.console.log("Method: " + ObjectUtils_1.default.getProp(res, "request.method"));
            BeachDayReporter_1.console.log("Request Headers:\n" + JSON.stringify(requestHeaders, null, 4));
            BeachDayReporter_1.console.log("Body:\n" + requestBody);
            BeachDayReporter_1.console.log("");
            BeachDayReporter_1.console.log("HTTP Timeout Used: " + (options.timeout / 1000) + "s");
            BeachDayReporter_1.console.log("");
        }
    };
    RequestRunner.request = request;
    RequestRunner.globalDefaults = new CallConfig_1.CallConfig();
    return RequestRunner;
}());
exports.RequestRunner = RequestRunner;
