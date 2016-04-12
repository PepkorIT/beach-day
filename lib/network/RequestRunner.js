"use strict";
var BeachDayReporter_1 = require("../reporter/BeachDayReporter");
var TestUtils_1 = require("../utils/TestUtils");
var CallConfig_1 = require("./CallConfig");
var _ = require("lodash");
var request = require("request");
var BeachDayReporter_2 = require("../reporter/BeachDayReporter");
var ObjectUtils_1 = require("../utils/ObjectUtils");
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
        if (!RequestRunner.hasHeader(call.headers, "Content-Type")) {
            headers["Content-Type"] = "application/json";
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
                uri: call.fullURL,
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
            var currSpecId = BeachDayReporter_2.getCurrentSpecId();
            RequestRunner.request(options, function (error, res, body) {
                // We wrap this section as it is executed asynchronously and jasmine cannot catch it.
                // This should be removed when jasmine supports it: https://github.com/jasmine/jasmine/issues/529
                try {
                    // Ensure the same tests is still running
                    if (currSpecId != BeachDayReporter_2.getCurrentSpecId()) {
                        TestUtils_1.TestUtils.throwImplementationError("HTTP callback was executed after the test had been completed. Please check your timeouts to make sure the test is not timing out before the HTTP request.");
                        return;
                    }
                    if (error) {
                        // Log out the request and response
                        //console.log("request() timeout with:");
                        //console.log(options);
                        RequestRunner.logRequestResponse(error, res, body, options);
                        TestUtils_1.TestUtils.throwExpectError("Expected HTTP call to be successful");
                    }
                    else {
                        // Try convert the json response
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
                                BeachDayReporter_1.console.log(body);
                            }
                        }
                        // Set the body on the environment
                        env.currentBody = body;
                        // Run obfuscation
                        if (parsePassed)
                            call.obfuscateFuncImpl(env, body, res);
                        // Log out the request and response
                        RequestRunner.logRequestResponse(error, res, body, options);
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
    RequestRunner.logRequestResponse = function (error, res, body, options) {
        if (res) {
            BeachDayReporter_1.console.log("<strong>REQUEST</strong>");
            BeachDayReporter_1.console.log("<hr class='short' />");
            BeachDayReporter_1.console.log("URL: " + ObjectUtils_1.default.getProp(res, "request.uri.href"));
            BeachDayReporter_1.console.log("Method: " + ObjectUtils_1.default.getProp(res, "res.request.method"));
            BeachDayReporter_1.console.log("Request Headers:\n" + JSON.stringify(ObjectUtils_1.default.getProp(res, "request.headers"), null, 4));
            BeachDayReporter_1.console.log("Body:\n" + ObjectUtils_1.default.getProp(res, "request.body"));
            BeachDayReporter_1.console.log("");
            BeachDayReporter_1.console.log("<strong>RESPONSE</strong>");
            BeachDayReporter_1.console.log("<hr class='short' />");
            BeachDayReporter_1.console.log("Status Code: " + res.statusCode);
            BeachDayReporter_1.console.log("Response Headers:\n" + JSON.stringify(res.headers, null, 4));
            BeachDayReporter_1.console.log("Body:\n" + JSON.stringify(body, null, 4));
            BeachDayReporter_1.console.log("");
        }
        else {
            BeachDayReporter_1.console.log("<strong>Request library error:</strong>");
            BeachDayReporter_1.console.log(JSON.stringify(error, null, 4));
            BeachDayReporter_1.console.log("<strong>REQUEST</strong>");
            BeachDayReporter_1.console.log("<hr class='short' />");
            BeachDayReporter_1.console.log("URL: " + options.uri);
            BeachDayReporter_1.console.log("Method: " + options.method);
            BeachDayReporter_1.console.log("Request Headers:\n" + JSON.stringify(options.headers, null, 4));
            if (options.body) {
                var body = options.body;
                if (RequestRunner.hasHeader(options.headers, "content-type", "application/json")) {
                    body = JSON.stringify(JSON.parse(body), null, 4);
                }
                BeachDayReporter_1.console.log("Body:\n" + body);
            }
            BeachDayReporter_1.console.log("Timeout: " + options.timeout);
            BeachDayReporter_1.console.log("");
        }
    };
    RequestRunner.request = request;
    RequestRunner.globalDefaults = new CallConfig_1.CallConfig();
    return RequestRunner;
}());
exports.RequestRunner = RequestRunner;
