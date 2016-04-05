import {CallRunner, CallConfig, JasmineAsyncEnv, console} from "../../lib/index";
import {IncomingMessage} from "http";

describe("Config system used to power the framework calls", function(){
    var factory:CallRunner;
    var env = new JasmineAsyncEnv();

    beforeEach(function(){
        factory = new CallRunner();
    });

    it("Build default config - expect pass", function(){
        var assertSpy1              = jasmine.createSpy("assert1");
        var assertSpy2              = jasmine.createSpy("assert2");
        var obfuSpy1                = jasmine.createSpy("obfuSpy1");
        var obfuSpy2                = jasmine.createSpy("obfuSpy2");
        var checkRequestSchemaSpy   = jasmine.createSpy("checkRequestSchemaSpy");
        var checkResponseSchemaSpy  = jasmine.createSpy("checkResponseSchemaSpy");

        factory.defaultConfig = new CallConfig({
            baseURL                 : "http://www.something.com//",
            assertFuncArr           : [assertSpy1],
            dataArr                 : [{id:1}],
            obfuscateArr            : [obfuSpy1],
            checkRequestSchemaFunc  : checkRequestSchemaSpy,
            checkResponseSchemaFunc : checkResponseSchemaSpy,
            checkRequestSchema      : true,
            checkResponseSchema     : true
        });

        var config = factory.defaultConfig.extend({
            endPoint        : "/fetch/user",
            assertFuncArr   : [assertSpy2],
            dataArr         : [function(env:JasmineAsyncEnv){
                return {name:"jon"};
            }],
            obfuscateArr    : [obfuSpy2]
        });

        expect(config.baseURL).toBe(factory.defaultConfig.baseURL);
        expect(config.endPoint).toBe("/fetch/user");
        expect(config.fullURL).toBe("http://www.something.com/fetch/user");

        // Check data expansion
        var data = config.getDataImpl(env);
        expect(data["id"]).toBe(1);
        expect(data["name"]).toBe("jon");

        // Check assert functions
        config.assertFuncImpl(env, null, null);
        expect(assertSpy1).toHaveBeenCalledWith(env, config, null, null);
        expect(assertSpy2).toHaveBeenCalledWith(env, config, null, null);

        // Check obfuscate execution
        config.obfuscateFuncImpl(env, null, null);
        expect(obfuSpy1).toHaveBeenCalledWith(env, config, null, null);
        expect(obfuSpy2).toHaveBeenCalledWith(env, config, null, null);

        // Check schema execution
        config.checkSchemaImpl(env, null, true, null);
        expect(checkRequestSchemaSpy).toHaveBeenCalledWith(env, config, null, null);

        config.checkSchemaImpl(env, null, false, null);
        expect(checkResponseSchemaSpy).toHaveBeenCalledWith(env, config, null, null);

    });

    it("Test that the extension is working", function(){
        var defaultConfig   = new CallConfig({});
        var callConfig      = new CallConfig({status:500});
        console.log("Using callconfig in test: ", callConfig);
        var useConfig       = defaultConfig.extend(callConfig);
        expect(useConfig.status).toBe(500);
    });

});