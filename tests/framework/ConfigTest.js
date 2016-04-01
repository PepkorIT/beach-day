"use strict";
var index_1 = require("../../lib/index");
describe("Config system used to power the framework calls", function () {
    var factory;
    var env = new index_1.JasmineAsyncEnv();
    beforeEach(function () {
        factory = new index_1.CallRunner();
    });
    it("Build default config - expect pass", function () {
        var assertSpy1 = jasmine.createSpy("assert1");
        var assertSpy2 = jasmine.createSpy("assert2");
        var obfuSpy1 = jasmine.createSpy("obfuSpy1");
        var obfuSpy2 = jasmine.createSpy("obfuSpy2");
        var checkSchemaSpy = jasmine.createSpy("checkSchemaSpy");
        factory.defaultConfig = new index_1.CallConfig({
            baseURL: "http://www.something.com//",
            assertFuncArr: [assertSpy1],
            dataArr: [{ id: 1 }],
            obfuscateArr: [obfuSpy1],
            checkSchemaFunc: checkSchemaSpy,
            checkRequestSchema: true
        });
        var config = factory.defaultConfig.extend({
            endPoint: "/fetch/user",
            assertFuncArr: [assertSpy2],
            dataArr: [function (env) {
                    return { name: "jon" };
                }],
            obfuscateArr: [obfuSpy2]
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
        expect(assertSpy1).toHaveBeenCalledWith(env, null, null);
        expect(assertSpy2).toHaveBeenCalledWith(env, null, null);
        // Check obfuscate execution
        config.obfuscateFuncImpl(env, null, null);
        expect(obfuSpy1).toHaveBeenCalledWith(config, env, null, null);
        expect(obfuSpy2).toHaveBeenCalledWith(config, env, null, null);
        // Check schema execution
        config.checkSchemaImpl(env, true);
        expect(checkSchemaSpy).toHaveBeenCalledWith(config, env, true);
    });
});
