import {JasmineAsyncEnv} from "../../lib/utils/JasmineAsyncEnv";
import {TestUtils} from "../../lib/utils/TestUtils";
import ObjectUtils from "../../lib/utils/ObjectUtils";

describe("JasmineAsyncEnv Tests", function(){

    var dummyEnv = new JasmineAsyncEnv();

    var throwExpectError:jasmine.Spy,
        getProp:jasmine.Spy;

    beforeEach(function(){
        throwExpectError            = jasmine.createSpy("throwExpectError");
        TestUtils.throwExpectError  = throwExpectError;
    });

    it("Test JasmineAsyncEnv.checkPropDoesntExist failing", function(){
        spyOn(ObjectUtils, "getProp").and.callThrough();
        dummyEnv.currentBody = {prop1:"something"};
        dummyEnv.checkPropDoesntExist("prop1");

        expect(ObjectUtils.getProp).toHaveBeenCalledWith(dummyEnv.currentBody, "prop1");
        expect(throwExpectError).toHaveBeenCalled();
    });

    it("Test JasmineAsyncEnv.checkPropDoesntExist working", function(){
        spyOn(ObjectUtils, "getProp").and.callThrough();
        dummyEnv.currentBody = {prop1:"something"};
        dummyEnv.checkPropDoesntExist("prop2");

        expect(ObjectUtils.getProp).toHaveBeenCalledWith(dummyEnv.currentBody, "prop2");
        expect(throwExpectError).not.toHaveBeenCalled();
    });

});