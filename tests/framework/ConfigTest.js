"use strict";
var index_1 = require("../../lib/index");
describe("Config system used to power the framework calls", function () {
    var factory;
    var env = new index_1.JasmineAsyncEnv();
    beforeEach(function () {
        factory = new index_1.RequestRunner();
    });
    it("Build default config - expect pass", function () {
        var assertSpy1 = jasmine.createSpy("assert1");
        var assertSpy2 = jasmine.createSpy("assert2");
        var obfuSpy1 = jasmine.createSpy("obfuSpy1");
        var obfuSpy2 = jasmine.createSpy("obfuSpy2");
        var checkRequestSchemaSpy = jasmine.createSpy("checkRequestSchemaSpy");
        var checkResponseSchemaSpy = jasmine.createSpy("checkResponseSchemaSpy");
        var defaultConfig = new index_1.CallConfig({
            baseURL: "http://www.something.com//",
            assertFuncArr: [assertSpy1],
            dataArr: [{ id: 1 }],
            obfuscateArr: [obfuSpy1],
            checkRequestSchemaFunc: checkRequestSchemaSpy,
            checkResponseSchemaFunc: checkResponseSchemaSpy,
            checkRequestSchema: true,
            checkResponseSchema: true
        });
        var config = defaultConfig.extend({
            endPoint: "/fetch/user",
            assertFuncArr: [assertSpy2],
            dataArr: [function (env) {
                    return { name: "jon" };
                }],
            obfuscateArr: [obfuSpy2]
        });
        expect(config.baseURL).toBe(defaultConfig.baseURL);
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
    it("Test that the extension is working", function () {
        var defaultConfig = new index_1.CallConfig({});
        var callConfig = new index_1.CallConfig({ status: 500 });
        index_1.console.log("Using callconfig in test: ", callConfig);
        var useConfig = defaultConfig.extend(callConfig);
        expect(useConfig.status).toBe(500);
    });
});
