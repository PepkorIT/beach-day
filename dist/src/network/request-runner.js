"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var beach_day_reporter_1 = require("../reporter/beach-day-reporter");
var test_utils_1 = require("../utils/test-utils");
var call_config_1 = require("./call-config");
var object_utils_1 = require("../utils/object-utils");
var _ = require("lodash");
var request = require("request");
var URL = require("url");
var escapeHtml = require("escape-html");
var RequestRunner = /** @class */ (function () {
    function RequestRunner() {
    }
    /**
     * Utility helper method for executing a request package
     * call using a CallConfig and an environment
     */
    RequestRunner.run = function (call, env) {
        call = RequestRunner.globalDefaults ? RequestRunner.globalDefaults.extend(call) : call;
        // Check required props
        var required = ['endPoint', 'baseURL'];
        for (var i = 0; i < required.length; i++) {
            if (call[required[i]] == null) {
                test_utils_1.TestUtils.throwImplementationError(required[i] + " is a required property to run your CallConfig: " + JSON.stringify(call, null, 4));
                env.done();
                return;
            }
        }
        // Finally add some defaults if they don't exist
        if (call.method == null)
            call.method = 'GET';
        // Run the before calls for any last transformations
        call.beforeProxy(env);
        // Header generation
        var sendHeaders = call.getHeadersImpl(env) || {};
        // Default headers to use json
        if (!RequestRunner.hasHeader(sendHeaders, 'content-type')) {
            sendHeaders['content-type'] = 'application/json';
        }
        var requestPassed = true;
        var sendBody;
        if (call.method != 'GET') {
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
            var options_1 = _.extend({}, call.requestOptions, {
                uri: call.getFullURL(env),
                method: call.method.toUpperCase(),
                headers: sendHeaders,
                json: false,
                body: sendBody,
                timeout: call.timeout
            });
            //console.log("running request() with:");
            //console.log(options);
            // Fetch the current spec ID from the reporter so we can
            // ensure the test is still running when we complete the request call
            var currSpecId_1 = beach_day_reporter_1.ReporterAPI.getCurrentSpecId();
            RequestRunner.request(options_1, function (error, sourceRes, body) {
                var res = sourceRes;
                // We wrap this section as it is executed asynchronously and jasmine cannot catch it.
                // This should be removed when jasmine supports it: https://github.com/jasmine/jasmine/issues/529
                var promise;
                if (call.requestCallback) {
                    promise = call.requestCallback(error, sourceRes, body);
                }
                else {
                    promise = Promise.resolve({ error: error, response: sourceRes, body: body });
                }
                promise.then(function (response) {
                    if (response) {
                        error = response.error;
                        sourceRes = response.response;
                        body = response.body;
                    }
                    else {
                        test_utils_1.TestUtils.throwImplementationError('requestCallback did not return a response');
                    }
                    try {
                        // Ensure the same tests is still running
                        if (currSpecId_1 != beach_day_reporter_1.ReporterAPI.getCurrentSpecId()) {
                            test_utils_1.TestUtils.throwImplementationError('HTTP callback was executed after the test had been completed. Please check your timeouts to make sure the test is not timing out before the HTTP request.');
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
                                    uri: URL.parse(options_1.uri),
                                    method: options_1['method'],
                                    headers: options_1['sendHeaders'],
                                    body: options_1['body']
                                }
                            };
                            call.obfuscateFuncImpl(env, null, fakeResponse);
                            RequestRunner.logRequestResponse(error, fakeResponse, body, options_1, true, true);
                            if (call.allowHTTPErrors != null) {
                                if (call.allowHTTPErrors === true) {
                                    // Do nothing
                                }
                                else if (typeof call.allowHTTPErrors == 'function' && !call.allowHTTPErrors(error, env, call, fakeResponse)) {
                                    test_utils_1.TestUtils.throwExpectError('Expected HTTP call to be successful');
                                }
                            }
                            else {
                                test_utils_1.TestUtils.throwExpectError('Expected HTTP call to be successful');
                            }
                        }
                        else {
                            // Try convert the response using the dataDeSerialisationFunc or JSON.parse()
                            var parsePassed = true;
                            if (body && typeof body == 'string') {
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
                                    test_utils_1.TestUtils.throwExpectError('Expected JSON parsing from the server to pass');
                                    beach_day_reporter_1.console.log('Parsing Error: ');
                                    beach_day_reporter_1.console.log(e.message);
                                    beach_day_reporter_1.console.log('Original data from server:');
                                    // Escape before logging it as this will form part of the report
                                    beach_day_reporter_1.console.log(escapeHtml(body));
                                }
                            }
                            // Set the body on the environment
                            env.currentBody = body;
                            // Run obfuscation
                            if (parsePassed)
                                call.obfuscateFuncImpl(env, body, res);
                            // Log out the request and response
                            RequestRunner.logRequestResponse(error, res, body, options_1, false, parsePassed);
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
                        test_utils_1.TestUtils.throwImplementationError(e.stack);
                        env.done();
                    }
                }).catch(function (err) {
                    var message = 'requestCallback promise rejection';
                    if (err && err.stack) {
                        message = err.stack;
                    }
                    test_utils_1.TestUtils.throwImplementationError(message);
                    env.done();
                });
            });
        }
    };
    RequestRunner.runPoll = function (call, env, pollComplete, maximumRunTime) {
        var executeNextCall = function () {
            RequestRunner.run(call, env);
        };
        var startTime = new Date().getTime();
        var maxCallTime = beach_day_reporter_1.ReporterAPI.getReporterConfig().maxTestTime;
        var originalDone = env.done;
        call.assertFuncArr = call.assertFuncArr || [];
        var lastBody;
        var lastRes;
        call.assertFuncArr.push(function (env, call, body, res) {
            lastBody = body;
            lastRes = res;
        });
        env.done = function () {
            var response = pollComplete(env, call, lastBody, lastRes);
            if (response.complete) {
                env.done = originalDone;
                env.done();
            }
            else {
                var currentLength = (new Date()).getTime() - startTime;
                // Check the run time against the maximum
                if (currentLength + response.nextPollDelay >= maximumRunTime) {
                    test_utils_1.TestUtils.throwExpectError('Poll maximum run time met');
                    env.done = originalDone;
                    env.done();
                }
                else {
                    // Set the max test time to what has passed + the nextPollDelay + the max call time
                    beach_day_reporter_1.ReporterAPI.overrideSpecMaxTestTime(currentLength + response.nextPollDelay + maxCallTime);
                    setTimeout(executeNextCall, response.nextPollDelay);
                }
            }
        };
        executeNextCall();
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
        var requestBody = object_utils_1.default.getProp(res, 'request.body');
        var requestHeaders = object_utils_1.default.getProp(res, 'request.headers');
        // Pretty print the request response if we deem it to be of type JSON
        if (requestHeaders && requestBody && RequestRunner.hasHeader(requestHeaders, 'content-type', 'application/json')) {
            requestBody = JSON.stringify(JSON.parse(requestBody), null, 4);
        }
        if (requestBody == null)
            requestBody = '';
        // Pretty print the response body only if it is already an object
        if (parsedResponseBody && typeof parsedResponseBody == 'object') {
            parsedResponseBody = JSON.stringify(parsedResponseBody, null, 4);
        }
        // body is in fact not parsed and must be escaped in case
        if (parsePassed == false) {
            parsedResponseBody = escapeHtml(parsedResponseBody);
        }
        if (!isError) {
            beach_day_reporter_1.console.log('<strong>REQUEST</strong>');
            beach_day_reporter_1.console.log('<hr class="short" />');
            beach_day_reporter_1.console.log('URL: ' + object_utils_1.default.getProp(res, 'request.uri.href'));
            beach_day_reporter_1.console.log('Method: ' + object_utils_1.default.getProp(res, 'request.method'));
            beach_day_reporter_1.console.log('Request Headers:\n' + JSON.stringify(requestHeaders, null, 4));
            beach_day_reporter_1.console.log('Body:\n' + requestBody);
            beach_day_reporter_1.console.log('');
            beach_day_reporter_1.console.log('<strong>RESPONSE</strong>');
            beach_day_reporter_1.console.log('<hr class="short"/>');
            beach_day_reporter_1.console.log('Status Code: ' + res.statusCode);
            beach_day_reporter_1.console.log('Response Headers:\n' + JSON.stringify(res.headers, null, 4));
            beach_day_reporter_1.console.log('Body:\n' + parsedResponseBody);
            beach_day_reporter_1.console.log('');
        }
        else {
            beach_day_reporter_1.console.log('<strong>Request library error:</strong>');
            beach_day_reporter_1.console.log(JSON.stringify(error, null, 4));
            beach_day_reporter_1.console.log('<strong>REQUEST</strong>');
            beach_day_reporter_1.console.log('<hr class="short"/>');
            beach_day_reporter_1.console.log('URL: ' + object_utils_1.default.getProp(res, 'request.uri.href'));
            beach_day_reporter_1.console.log('Method: ' + object_utils_1.default.getProp(res, 'request.method'));
            beach_day_reporter_1.console.log('Request Headers:\n' + JSON.stringify(requestHeaders, null, 4));
            beach_day_reporter_1.console.log('Body:\n' + requestBody);
            beach_day_reporter_1.console.log('');
            beach_day_reporter_1.console.log('HTTP Timeout Used: ' + (options.timeout / 1000) + 's');
            beach_day_reporter_1.console.log('');
        }
    };
    RequestRunner.request = request;
    RequestRunner.globalDefaults = new call_config_1.CallConfig();
    return RequestRunner;
}());
exports.RequestRunner = RequestRunner;
//# sourceMappingURL=request-runner.js.map