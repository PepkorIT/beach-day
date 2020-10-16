import {JasmineAsyncEnv} from '../utils/jasmine-async-env';
import {console, ReporterAPI} from '../reporter/beach-day-reporter';
import {TestUtils} from '../utils/test-utils';
import {CallConfig, IAllowErrorFunc, IRequestCallbackResponse} from './call-config';
import {IRequestResponse} from './i-request-response';
import * as _ from 'lodash';
import * as request from 'request';
import * as URL from 'url';
import * as escapeHtml from 'escape-html';
import {ObjectUtils} from '..';

export interface PollCompleteFunc {
    (env:JasmineAsyncEnv, call:CallConfig, body:any, res:IRequestResponse):{ complete:boolean, nextPollDelay:number, failureMessage:string };
}

export class RequestRunner {

    public static request = request;

    public static globalDefaults = new CallConfig();

    public static HEADER_CONTENT_TYPE = 'content-type';
    public static JSON_C_TYPE         = 'application/json';
    public static FORM_C_TYPE         = 'application/x-www-form-urlencoded';

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
        if (!RequestRunner.hasHeader(sendHeaders, this.HEADER_CONTENT_TYPE)) {
            sendHeaders[this.HEADER_CONTENT_TYPE] = this.JSON_C_TYPE;
        }

        let requestPassed = true;

        let sendBody;
        if (call.method != 'GET') {
            let data = call.getDataImpl(env);
            //console.log('data after fetch: ', data);
            if (data) {
                requestPassed = call.checkSchemaImpl(env, data, true, null);
                if (call.dataSerialisationFunc != null) {
                    sendBody = call.dataSerialisationFunc(env, call, data);
                }
                else if (RequestRunner.hasHeader(sendHeaders, this.HEADER_CONTENT_TYPE, this.JSON_C_TYPE)) {
                    sendBody = JSON.stringify(data);
                }
                else {
                    sendBody = data;
                }
            }
        }

        if (!requestPassed) {
            // Just complete the request if there are any errors
            env.done();
        }
        else {
            const isFormParams = RequestRunner.hasHeader(sendHeaders, this.HEADER_CONTENT_TYPE, this.FORM_C_TYPE);

            // Create the options from the options in the config then the derived data
            let options = <request.UriOptions>_.extend({}, call.requestOptions, <request.CoreOptions>{
                uri    : call.getFullURL(env),
                method : call.method.toUpperCase(),
                headers: sendHeaders,
                json   : false, // This is done manually so we can catch errors
                body   : !isFormParams ? sendBody : undefined,
                form   : isFormParams ? sendBody : undefined,
                timeout: call.timeout
            });

            //console.log('running request() with:');
            //console.log(options);
            //console.log('isFormParams: ', isFormParams);
            //console.log('sendBody: ', sendBody);

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
                                    body   : options['body'],
                                    form   : options['form']
                                }
                            };

                            RequestRunner.logRequestResponse(call, env, error, fakeResponse, body, options, true, true);
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
                            // Manually apply the form params as not not the source
                            // Null check for tests
                            if (!res.request) res.request = <any>{};
                            res.request.form = sendBody;

                            // Set the body on the environment
                            env.currentBody = body;

                            // Log out the request and response
                            RequestRunner.logRequestResponse(call, env, error, res, body, options, false, parsePassed);

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
                    TestUtils.throwExpectError(response.failureMessage);
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
     * Pretty logging for the reporter of the request and response
     */
    public static logRequestResponse(call:CallConfig, env:JasmineAsyncEnv, error:any, res:IRequestResponse, parsedResponseBody:any, options:any, isError:boolean, parsePassed:boolean) {
        var requestBody          = ObjectUtils.getProp(res, 'request.body');
        var form                 = ObjectUtils.getProp(res, 'request.form');
        var requestHeaders       = ObjectUtils.getProp(res, 'request.headers');
        let requestBodyFormatted = '';

        // Pretty print the request response if we deem it to be of type JSON
        if (requestHeaders && requestBody && RequestRunner.hasHeader(requestHeaders, this.HEADER_CONTENT_TYPE, this.JSON_C_TYPE)) {
            let body             = JSON.parse(requestBody);
            body                 = call.obfuscateFuncImpl('reqBody', env, body, res);
            requestBodyFormatted = JSON.stringify(body, null, 4);
        }
        else if (requestHeaders && form && RequestRunner.hasHeader(requestHeaders, this.HEADER_CONTENT_TYPE, this.FORM_C_TYPE)) {
            form                 = call.obfuscateFuncImpl('reqBody', env, form, res);
            const keyValues      = Object.keys(form).map(key => `${key}=${form[key]}`);
            requestBodyFormatted = keyValues.join('\n');
            //console.log('keyValues: ', keyValues);
        }
        //console.log('form: ', form);
        //console.log('requestHeaders: ', requestHeaders);
        //console.log('requestBodyFormatted: ', requestBodyFormatted);
        //console.log('hasHeader: ', RequestRunner.hasHeader(requestHeaders, this.HEADER_CONTENT_TYPE, this.FORM_C_TYPE));

        if (requestHeaders) requestHeaders = call.obfuscateFuncImpl('reqHeaders', env, requestHeaders, res);

        if (requestBodyFormatted == null) requestBodyFormatted = '';

        // Obfuscate the response body & headers
        let responseHeaders = res.headers;
        if (parsedResponseBody) {
            parsedResponseBody = call.obfuscateFuncImpl('resBody', env, parsedResponseBody, res);
        }
        if (responseHeaders) {
            responseHeaders = call.obfuscateFuncImpl('resHeaders', env, responseHeaders, res);
        }

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
            console.log('Body:\n' + requestBodyFormatted);

            console.log('');

            console.log('<strong>RESPONSE</strong>');
            console.log('<hr class="short"/>');
            console.log('Status Code: ' + res.statusCode);
            console.log('Response Headers:\n' + JSON.stringify(responseHeaders, null, 4));
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
            console.log('Body:\n' + requestBodyFormatted);

            console.log('');
            console.log('HTTP Timeout Used: ' + (options.timeout / 1000) + 's');
            console.log('');
        }
    }
}
