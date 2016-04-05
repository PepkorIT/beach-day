"use strict";
var JasmineAsyncEnv_1 = require("../../lib/utils/JasmineAsyncEnv");
describe("Environment checks", function () {
    var env = new JasmineAsyncEnv_1.JasmineAsyncEnv();
    var envOne = new JasmineAsyncEnv_1.JasmineAsyncEnv();
    envOne["something"] = "else";
    var envTwo = new JasmineAsyncEnv_1.JasmineAsyncEnv(envOne);
    it("Test linked environment", envTwo.wrap(function (envTwo) {
        expect(envTwo["something"]).toBe("else");
        envTwo.done();
    }));
    it("Env test failure", env.wrap(function () {
        expect(true).toBe(false);
        env.done();
    }));
    it("Expect this to not run", env.wrap(function () {
        expect("jon").toBe("jon");
        env.done();
    }));
});
