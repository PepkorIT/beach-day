import {JasmineAsyncEnv} from '../utils/JasmineAsyncEnv';
import {console, ReporterAPI} from '../reporter/BeachDayReporter';
import {TestUtils} from '../utils/TestUtils';
import {CallConfig, IAllowErrorFunc, IRequestCallbackResponse} from './CallConfig';
import ObjectUtils from '../utils/ObjectUtils';
import {IRequestResponse} from './IRequestResponse';
import * as _ from 'lodash';
import * as request from 'request';
import * as URL from 'url';
import * as escapeHtml from 'escape-html';

export interface PollCompleteFunc {
    (env:JasmineAsyncEnv, call:CallConfig, body:any, res:IRequestResponse):{ complete:boolean, nextPollDelay:number };
}

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
        let required = ['endPoint', 'baseURL'];
        for (let i = 0; i < required.length; i++) {
            if (call[required[i]] == null) {
                TestUtils.throwImplementationError(`${required[i]} is a required property to run your CallConfig: ${JSON.stringify(call, null, 4)}`);
                env.done();
                return;
            }
        }

        // Finally add some defaults if they don't exist
        if (call.method == null) call.method = 'GET';


        // Run the before calls for any last transformations
        call.beforeProxy(env);

        // Header generation
        let sendHeaders = call.getHeadersImpl(env) || {};

        // Default headers to use json
        if (!RequestRunner.hasHeader(sendHeaders, 'content-type')) {
            sendHeaders['content-type'] = 'application/json';
        }

        let requestPassed = true;

        let sendBody;
        if (call.method != 'GET') {
            let data = call.getDataImpl(env);
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
            let options = <request.UriOptions>_.extend({}, call.requestOptions, <request.CoreOptions>{
                uri    : call.getFullURL(env),
                method : call.method.toUpperCase(),
                headers: sendHeaders,
                json   : false, // This is done manually so we can catch errors
                body   : sendBody,
                timeout: call.timeout
            });

            //console.log("running request() with:");
            //console.log(options);

            // Fetch the current spec ID from the reporter so we can
            // ensure the test is still running when we complete the request call
            let currSpecId = ReporterAPI.getCurrentSpecId();

            RequestRunner.request(options, (error:any, sourceRes:any, body:any) => {
                let res:IRequestResponse = sourceRes;

                // We wrap this section as it is executed asynchronously and jasmine cannot catch it.
                // This should be removed when jasmine supports it: https://github.com/jasmine/jasmine/issues/529
                let promise:Promise<IRequestCallbackResponse>;
                if (call.requestCallback) {
                    promise = call.requestCallback(error, sourceRes, body);
                }
                else {
                    promise = Promise.resolve({error: error, response: sourceRes, body: body});
                }
                promise.then((response) => {
                    if (response) {
                        error     = response.error;
                        sourceRes = response.response;
                        body      = response.body;
                    }
                    else {
                        TestUtils.throwImplementationError('requestCallback did not return a response');
                    }


                    try {
                        // Ensure the same tests is still running
                        if (currSpecId != ReporterAPI.getCurrentSpecId()) {
                            TestUtils.throwImplementationError('HTTP callback was executed after the test had been completed. Please check your timeouts to make sure the test is not timing out before the HTTP request.');
                            return;
                        }
                        if (error) {
                            // Log out the request and response
                            // Generate a response object that is partially populated with only the request information
                            // We do this so the data for the request resides in the same place, always
                            let fakeResponse:IRequestResponse = {
                                headers   : null,
                                statusCode: 0,
                                body      : null,
                                request   : {
                                    uri    : URL.parse(<string>options.uri),
                                    method : options['method'],
                                    headers: options['sendHeaders'],
                                    body   : options['body']
                                }
                            };
                            call.obfuscateFuncImpl(env, null, fakeResponse);

                            RequestRunner.logRequestResponse(error, fakeResponse, body, options, true, true);
                            if (call.allowHTTPErrors != null) {
                                if (call.allowHTTPErrors === true) {
                                    // Do nothing
                                }
                                else if (typeof call.allowHTTPErrors == 'function' && !(<IAllowErrorFunc>call.allowHTTPErrors)(error, env, call, fakeResponse)) {
                                    TestUtils.throwExpectError('Expected HTTP call to be successful');
                                }
                            }
                            else {
                                TestUtils.throwExpectError('Expected HTTP call to be successful');
                            }
                        }
                        else {
                            // Try convert the response using the dataDeSerialisationFunc or JSON.parse()
                            let parsePassed = true;
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
                                    TestUtils.throwExpectError('Expected JSON parsing from the server to pass');
                                    console.log('Parsing Error: ');
                                    console.log(e.message);
                                    console.log('Original data from server:');
                                    // Escape before logging it as this will form part of the report
                                    console.log(escapeHtml(body));
                                }
                            }

                            // Set the body on the environment
                            env.currentBody = body;

                            // Run obfuscation
                            if (parsePassed) call.obfuscateFuncImpl(env, body, res);

                            // Log out the request and response
                            RequestRunner.logRequestResponse(error, res, body, options, false, parsePassed);

                            // Check schemas if setup
                            if (parsePassed) call.checkSchemaImpl(env, body, false, res);

                            // Run assertions
                            if (parsePassed) call.assertFuncImpl(env, body, res);
                        }

                        // Lastly call done()
                        env.done();
                    }
                        // Here we manually log an implementation error with the error stack.
                    catch (e) {
                        TestUtils.throwImplementationError(e.stack);
                        env.done();
                    }

                }).catch((err) => {
                    let message = 'requestCallback promise rejection';
                    if (err && err.stack) {
                        message = err.stack;
                    }
                    TestUtils.throwImplementationError(message);
                    env.done();
                });


            });
        }
    }

    public static runPoll(call:CallConfig, env:JasmineAsyncEnv, pollComplete:PollCompleteFunc, maximumRunTime:number):void {
        let executeNextCall = () => {
            RequestRunner.run(call, env);
        };

        let startTime      = new Date().getTime();
        let maxCallTime    = ReporterAPI.getReporterConfig().maxTestTime;
        let originalDone   = env.done;
        call.assertFuncArr = call.assertFuncArr || [];

        let lastBody:any;
        let lastRes:IRequestResponse;
        call.assertFuncArr.push((env:JasmineAsyncEnv, call:CallConfig, body:any, res:IRequestResponse) => {
            lastBody = body;
            lastRes  = res;
        });

        env.done = () => {
            let response = pollComplete(env, call, lastBody, lastRes);
            if (response.complete) {
                env.done = originalDone;
                env.done();
            }
            else {
                let currentLength = (new Date()).getTime() - startTime;

                // Check the run time against the maximum
                if (currentLength + response.nextPollDelay >= maximumRunTime) {
                    TestUtils.throwExpectError('Poll maximum run time met');
                    env.done = originalDone;
                    env.done();
                }
                else {
                    // Set the max test time to what has passed + the nextPollDelay + the max call time
                    ReporterAPI.overrideSpecMaxTestTime(currentLength + response.nextPollDelay + maxCallTime);

                    setTimeout(executeNextCall, response.nextPollDelay);
                }
            }
        };

        executeNextCall();
    }

    public static hasHeader(headers:any, name:string, value?:string):boolean {
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
    }

    /**
     * Pretty logging for the reporter of the request and repsonse
     */
    public static logRequestResponse(error:any, res:IRequestResponse, parsedResponseBody:any, options:any, isError:boolean, parsePassed:boolean) {
        var requestBody    = ObjectUtils.getProp(res, 'request.body');
        var requestHeaders = ObjectUtils.getProp(res, 'request.headers');

        // Pretty print the request response if we deem it to be of type JSON
        if (requestHeaders && requestBody && RequestRunner.hasHeader(requestHeaders, 'content-type', 'application/json')) {
            requestBody = JSON.stringify(JSON.parse(requestBody), null, 4);
        }
        if (requestBody == null) requestBody = '';

        // Pretty print the response body only if it is already an object
        if (parsedResponseBody && typeof parsedResponseBody == 'object') {
            parsedResponseBody = JSON.stringify(parsedResponseBody, null, 4);
        }
        // body is in fact not parsed and must be escaped in case
        if (parsePassed == false) {
            parsedResponseBody = escapeHtml(parsedResponseBody);
        }

        if (!isError) {
            console.log('<strong>REQUEST</strong>');
            console.log('<hr class="short" />');
            console.log('URL: ' + ObjectUtils.getProp(res, 'request.uri.href'));
            console.log('Method: ' + ObjectUtils.getProp(res, 'request.method'));
            console.log('Request Headers:\n' + JSON.stringify(requestHeaders, null, 4));
            console.log('Body:\n' + requestBody);

            console.log('');

            console.log('<strong>RESPONSE</strong>');
            console.log('<hr class="short"/>');
            console.log('Status Code: ' + res.statusCode);
            console.log('Response Headers:\n' + JSON.stringify(res.headers, null, 4));
            console.log('Body:\n' + parsedResponseBody);
            console.log('');
        }
        else {
            console.log('<strong>Request library error:</strong>');
            console.log(JSON.stringify(error, null, 4));

            console.log('<strong>REQUEST</strong>');    
            console.log('<hr class="short"/>');
            console.log('URL: ' + ObjectUtils.getProp(res, 'request.uri.href'));
            console.log('Method: ' + ObjectUtils.getProp(res, 'request.method'));
            console.log('Request Headers:\n' + JSON.stringify(requestHeaders, null, 4));
            console.log('Body:\n' + requestBody);

            console.log('');
            console.log('HTTP Timeout Used: ' + (options.timeout / 1000) + 's');
            console.log('');
        }
    }
}
