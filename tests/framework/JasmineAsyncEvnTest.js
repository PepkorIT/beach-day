"use strict";
var JasmineAsyncEnv_1 = require("../../lib/utils/JasmineAsyncEnv");
var TestUtils_1 = require("../../lib/utils/TestUtils");
var ObjectUtils_1 = require("../../lib/utils/ObjectUtils");
describe("JasmineAsyncEnv Tests", function () {
    var dummyEnv = new JasmineAsyncEnv_1.JasmineAsyncEnv();
    var throwExpectError, getProp;
    beforeEach(function () {
        throwExpectError = jasmine.createSpy("throwExpectError");
        TestUtils_1.TestUtils.throwExpectError = throwExpectError;
    });
    it("Test JasmineAsyncEnv.checkPropDoesntExist failing", function () {
        spyOn(ObjectUtils_1.default, "getProp").and.callThrough();
        dummyEnv.currentBody = { prop1: "something" };
        dummyEnv.checkPropDoesntExist("prop1");
        expect(ObjectUtils_1.default.getProp).toHaveBeenCalledWith(dummyEnv.currentBody, "prop1");
        expect(throwExpectError).toHaveBeenCalled();
    });
    it("Test JasmineAsyncEnv.checkPropDoesntExist working", function () {
        spyOn(ObjectUtils_1.default, "getProp").and.callThrough();
        dummyEnv.currentBody = { prop1: "something" };
        dummyEnv.checkPropDoesntExist("prop2");
        expect(ObjectUtils_1.default.getProp).toHaveBeenCalledWith(dummyEnv.currentBody, "prop2");
        expect(throwExpectError).not.toHaveBeenCalled();
    });
});
