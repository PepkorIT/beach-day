import {RequestRunner} from "../../lib/network/RequestRunner";
import {JasmineAsyncEnv} from "../../lib/utils/JasmineAsyncEnv";
import {CallConfig} from "../../lib/network/CallConfig";
import {TestUtils} from "../../lib/utils/TestUtils";
import {CoreOptions} from "request";
import * as mockPromises from "mock-promises";

Promise = mockPromises.getMockPromise(Promise);

describe("RequestRunner tester", function(){

    var dummyEnv = new JasmineAsyncEnv();
    var done:jasmine.Spy,
        throwImplementationError:jasmine.Spy,
        throwExpectError:jasmine.Spy,
        request:jasmine.Spy;

    var defaultConfig = new CallConfig({endPoint:"/user", baseURL:"www.something.com//"});
    var requestOptions:CoreOptions,
        requestCB;

    beforeEach(function(){
        done            = jasmine.createSpy("done");
        dummyEnv.done   = done;

        request         = spyOn(RequestRunner, "request").and.callFake(function(options, cb){
            requestOptions = options;
            requestCB = cb;
        });

        throwImplementationError            = jasmine.createSpy("throwImplementationError");
        throwExpectError                    = jasmine.createSpy("throwExpectError");
        TestUtils.throwImplementationError  = throwImplementationError;
        TestUtils.throwExpectError          = throwExpectError;
    });

    it("Ensure errors for null props", function(){
        RequestRunner.run(new CallConfig(), dummyEnv);
        expect(throwImplementationError.calls.count()).toBe(1);

        RequestRunner.run(new CallConfig({endPoint:""}), dummyEnv);
        expect(throwImplementationError.calls.count()).toBe(2);

        RequestRunner.run(new CallConfig({endPoint:"", baseURL:""}), dummyEnv);
        expect(throwImplementationError.calls.count()).toBe(2);
    });

    it("Ensure default GET method", function(){
        RequestRunner.run(defaultConfig, dummyEnv);
        expect(requestOptions.method).toBe("GET");

        RequestRunner.run(defaultConfig.extend({method:"PUT"}), dummyEnv);
        expect(requestOptions.method).toBe("PUT");
    });

    it("Ensure beforeProxy is called", function(){
        var before = jasmine.createSpy("before");
        RequestRunner.run(defaultConfig.extend({beforeFuncArr:[before]}), dummyEnv);
        expect(before).toHaveBeenCalled();
    });

    it("Ensure default header is set", function(){
        RequestRunner.run(defaultConfig.extend({}), dummyEnv);
        expect(requestOptions.headers["content-type"]).toBe("application/json");

        RequestRunner.run(defaultConfig.extend({headers:{
            "content-type": "text/html"
        }}), dummyEnv);
        expect(requestOptions.headers["content-type"]).toBe("text/html");
    });

    it("Ensure data is sent as default JSON", function(){
        RequestRunner.run(defaultConfig.extend({dataArr:[{id:1}], method:"post"}), dummyEnv);
        expect(requestOptions.body).toBe( JSON.stringify({id:1}) );
    });

    it("Ensure serializer is used", function(){
        RequestRunner.run(defaultConfig.extend({dataArr:[{id:1}], method:"post", dataSerialisationFunc:function() { return "123"; }}), dummyEnv);
        expect(requestOptions.body).toBe("123");
    });

    it("Ensure checkRequestSchema is called", function(){
        var checkRequest = jasmine.createSpy("check");
        RequestRunner.run(defaultConfig.extend({dataArr:[{id:1}], method:"post", checkRequestSchema:true, checkRequestSchemaFunc:checkRequest}), dummyEnv);
        expect(checkRequest).toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it("Check all props passed to request", function(){
        RequestRunner.run(new CallConfig({
            baseURL     : "www.google.com/",
            endPoint    : "/users",
            method      : "post",
            dataArr     : [{id:1}],
            timeout     : 1000
        }), dummyEnv);

        expect(request).toHaveBeenCalledWith(jasmine.objectContaining({
            uri     : 'www.google.com/users',
            headers : {'content-type': 'application/json'},
            method  : "POST",
            json    : false,
            body    : '{"id":1}',
            timeout : 1000
        }), jasmine.any(Function))
    });


    var defaultConf = new CallConfig({
        baseURL     : "www.google.com/",
        endPoint    : "/users",
        method      : "post",
        dataArr     : [{id:1}],
        timeout     : 1000
    });

    it("Ensure errors are caught", function(){
        RequestRunner.run(defaultConf, dummyEnv);
        requestCB({message:"error here"});
        mockPromises.tickAllTheWay();
        expect(throwExpectError).toHaveBeenCalled();
        expect(done).toHaveBeenCalled();
    });

    it("Ensure errors are allowed for boolean", function(){
        RequestRunner.run(defaultConf.extend({allowHTTPErrors:true}), dummyEnv);
        requestCB({message:"error here"});
        mockPromises.tickAllTheWay();
        expect(throwExpectError).not.toHaveBeenCalled();
        expect(done).toHaveBeenCalled();
    });

    it("Ensure errors are allowed for function", function(){
        var errorPassed;
        RequestRunner.run(defaultConf.extend({allowHTTPErrors:function(error){
            errorPassed = error;
            return true;
        }}), dummyEnv);
        requestCB({message:"error here"});
        mockPromises.tickAllTheWay();
        expect(throwExpectError).not.toHaveBeenCalled();
        expect(done).toHaveBeenCalled();
        expect(errorPassed.message).toBe("error here");
    });

    it("Ensure invalid JSON is caught", function(){
        RequestRunner.run(defaultConf, dummyEnv);
        requestCB(null, {}, "{something: sdds");
        mockPromises.tickAllTheWay();
        expect(throwExpectError).toHaveBeenCalled();
        expect(done).toHaveBeenCalled();
        expect(dummyEnv.currentBody).toBe("{something: sdds");
    });

    it("Ensure deserialise is run", function(){
        var dataDeSerialisationFunc = jasmine.createSpy("dataDeSerialisationFunc");
        RequestRunner.run(defaultConf.extend({
            dataDeSerialisationFunc : dataDeSerialisationFunc
        }), dummyEnv);
        requestCB(null, {}, "{something: sdds");
        mockPromises.tickAllTheWay();
        expect(dataDeSerialisationFunc).toHaveBeenCalled();
    });

    it("Ensure obsfucate is called", function(){
        var obsfu = jasmine.createSpy("dataDeSerialisationFunc");
        RequestRunner.run(defaultConf.extend({
            obfuscateArr : [obsfu]
        }), dummyEnv);
        requestCB(null, {}, "");
        mockPromises.tickAllTheWay();
        expect(obsfu).toHaveBeenCalled();
    });

    it("Ensure check schema is called", function(){
        var checkSchema = jasmine.createSpy("checkSchema");
        RequestRunner.run(defaultConf.extend({
            checkResponseSchema     : true,
            checkResponseSchemaFunc : checkSchema
        }), dummyEnv);
        requestCB(null, {}, "{}");
        mockPromises.tickAllTheWay();
        expect(checkSchema).toHaveBeenCalled();
    });

    it("Ensure assert func is called", function(){
        var assertFunc = jasmine.createSpy("checkSchema");
        RequestRunner.run(defaultConf.extend({
            assertFuncArr : [assertFunc]
        }), dummyEnv);
        requestCB(null, {}, "{}");
        mockPromises.tickAllTheWay();
        expect(assertFunc).toHaveBeenCalled();
    });

});