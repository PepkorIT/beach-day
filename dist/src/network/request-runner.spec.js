"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_runner_1 = require("./request-runner");
var call_config_1 = require("./call-config");
var mockPromises = require("mock-promises");
var __1 = require("..");
Promise = mockPromises.getMockPromise(Promise);
describe('RequestRunner tester', function () {
    var dummyEnv = new __1.JasmineAsyncEnv();
    var done, throwImplementationError, throwExpectError, request;
    var defaultConfig = new call_config_1.CallConfig({ endPoint: '/user', baseURL: 'www.something.com//' });
    var requestOptions, requestCB;
    beforeEach(function () {
        done = jasmine.createSpy('done');
        dummyEnv.done = done;
        request = spyOn(request_runner_1.RequestRunner, 'request').and.callFake(function (options, cb) {
            requestOptions = options;
            requestCB = cb;
        });
        throwImplementationError = spyOn(__1.TestUtils, 'throwImplementationError');
        throwExpectError = spyOn(__1.TestUtils, 'throwExpectError');
    });
    //afterEach(() => this.removeAllSpies());
    it('Ensure errors for null props', function () {
        request_runner_1.RequestRunner.run(new call_config_1.CallConfig(), dummyEnv);
        expect(throwImplementationError.calls.count()).toBe(1);
        request_runner_1.RequestRunner.run(new call_config_1.CallConfig({ endPoint: '' }), dummyEnv);
        expect(throwImplementationError.calls.count()).toBe(2);
        request_runner_1.RequestRunner.run(new call_config_1.CallConfig({ endPoint: '', baseURL: '' }), dummyEnv);
        expect(throwImplementationError.calls.count()).toBe(2);
    });
    it('Ensure default GET method', function () {
        request_runner_1.RequestRunner.run(defaultConfig, dummyEnv);
        expect(requestOptions.method).toBe('GET');
        request_runner_1.RequestRunner.run(defaultConfig.extend({ method: 'PUT' }), dummyEnv);
        expect(requestOptions.method).toBe('PUT');
    });
    it('Ensure beforeProxy is called', function () {
        var before = jasmine.createSpy('before');
        request_runner_1.RequestRunner.run(defaultConfig.extend({ beforeFuncArr: [before] }), dummyEnv);
        expect(before).toHaveBeenCalled();
    });
    it('Ensure default header is set', function () {
        request_runner_1.RequestRunner.run(defaultConfig.extend({}), dummyEnv);
        expect(requestOptions.headers['content-type']).toBe('application/json');
        request_runner_1.RequestRunner.run(defaultConfig.extend({
            headersArr: [{
                    'content-type': 'text/html'
                }]
        }), dummyEnv);
        expect(requestOptions.headers['content-type']).toBe('text/html');
    });
    it('Ensure default header does not override', function () {
        request_runner_1.RequestRunner.run(defaultConfig.extend({
            headersArr: [{
                    'Content-Type': 'text/html'
                }]
        }), dummyEnv);
        expect(requestOptions.headers['Content-Type']).toBe('text/html');
    });
    it('Ensure data is sent as default JSON', function () {
        request_runner_1.RequestRunner.run(defaultConfig.extend({ dataArr: [{ id: 1 }], method: 'post' }), dummyEnv);
        expect(requestOptions.body).toBe(JSON.stringify({ id: 1 }));
    });
    it('Ensure serializer is used', function () {
        request_runner_1.RequestRunner.run(defaultConfig.extend({
            dataArr: [{ id: 1 }], method: 'post', dataSerialisationFunc: function () {
                return '123';
            }
        }), dummyEnv);
        expect(requestOptions.body).toBe('123');
    });
    it('Ensure checkRequestSchema is called', function () {
        var checkRequest = jasmine.createSpy('check');
        request_runner_1.RequestRunner.run(defaultConfig.extend({ dataArr: [{ id: 1 }], method: 'post', checkRequestSchema: true, checkRequestSchemaFunc: checkRequest }), dummyEnv);
        expect(checkRequest).toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });
    it('Check all props passed to request', function () {
        request_runner_1.RequestRunner.run(new call_config_1.CallConfig({
            baseURL: 'www.google.com/',
            endPoint: '/users',
            method: 'post',
            dataArr: [{ id: 1 }],
            timeout: 1000
        }), dummyEnv);
        expect(request).toHaveBeenCalledWith(jasmine.objectContaining({
            uri: 'www.google.com/users',
            headers: { 'content-type': 'application/json' },
            method: 'POST',
            json: false,
            body: '{"id":1}',
            timeout: 1000
        }), jasmine.any(Function));
    });
    var defaultConf = new call_config_1.CallConfig({
        baseURL: 'www.google.com/',
        endPoint: '/users',
        method: 'post',
        dataArr: [{ id: 1 }],
        timeout: 1000
    });
    it('Ensure errors are caught', function () {
        request_runner_1.RequestRunner.run(defaultConf, dummyEnv);
        requestCB({ message: 'error here' });
        mockPromises.tickAllTheWay();
        expect(throwExpectError).toHaveBeenCalled();
        expect(done).toHaveBeenCalled();
    });
    it('Ensure errors are allowed for boolean', function () {
        request_runner_1.RequestRunner.run(defaultConf.extend({ allowHTTPErrors: true }), dummyEnv);
        requestCB({ message: 'error here' });
        mockPromises.tickAllTheWay();
        expect(throwExpectError).not.toHaveBeenCalled();
        expect(done).toHaveBeenCalled();
    });
    it('Ensure errors are allowed for function', function () {
        var errorPassed;
        request_runner_1.RequestRunner.run(defaultConf.extend({
            allowHTTPErrors: function (error) {
                errorPassed = error;
                return true;
            }
        }), dummyEnv);
        requestCB({ message: 'error here' });
        mockPromises.tickAllTheWay();
        expect(throwExpectError).not.toHaveBeenCalled();
        expect(done).toHaveBeenCalled();
        expect(errorPassed.message).toBe('error here');
    });
    it('Ensure invalid JSON is caught', function () {
        request_runner_1.RequestRunner.run(defaultConf, dummyEnv);
        requestCB(null, {}, '{something: sdds');
        mockPromises.tickAllTheWay();
        expect(throwExpectError).toHaveBeenCalled();
        expect(done).toHaveBeenCalled();
        expect(dummyEnv.currentBody).toBe('{something: sdds');
    });
    it('Ensure deserialise is run', function () {
        var dataDeSerialisationFunc = jasmine.createSpy('dataDeSerialisationFunc');
        request_runner_1.RequestRunner.run(defaultConf.extend({
            dataDeSerialisationFunc: dataDeSerialisationFunc
        }), dummyEnv);
        requestCB(null, {}, '{something: sdds');
        mockPromises.tickAllTheWay();
        expect(dataDeSerialisationFunc).toHaveBeenCalled();
    });
    it('Ensure obfuscate is called', function () {
        var obsfu = jasmine.createSpy('dataDeSerialisationFunc');
        request_runner_1.RequestRunner.run(defaultConf.extend({
            obfuscateResponseBodyArr: [obsfu]
        }), dummyEnv);
        requestCB(null, {}, {});
        mockPromises.tickAllTheWay();
        expect(obsfu).toHaveBeenCalled();
    });
    it('Ensure check schema is called', function () {
        var checkSchema = jasmine.createSpy('checkSchema');
        request_runner_1.RequestRunner.run(defaultConf.extend({
            checkResponseSchema: true,
            checkResponseSchemaFunc: checkSchema
        }), dummyEnv);
        requestCB(null, {}, '{}');
        mockPromises.tickAllTheWay();
        expect(checkSchema).toHaveBeenCalled();
    });
    it('Ensure assert func is called', function () {
        var assertFunc = jasmine.createSpy('checkSchema');
        request_runner_1.RequestRunner.run(defaultConf.extend({
            assertFuncArr: [assertFunc]
        }), dummyEnv);
        requestCB(null, {}, '{}');
        mockPromises.tickAllTheWay();
        expect(assertFunc).toHaveBeenCalled();
    });
});
//# sourceMappingURL=request-runner.spec.js.map