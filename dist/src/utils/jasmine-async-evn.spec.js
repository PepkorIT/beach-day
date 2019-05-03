"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jasmine_async_env_1 = require("./jasmine-async-env");
var test_utils_1 = require("./test-utils");
var object_utils_1 = require("./object-utils");
describe('JasmineAsyncEnv Tests', function () {
    var dummyEnv, throwExpectError;
    beforeEach(function () {
        throwExpectError = spyOn(test_utils_1.TestUtils, 'throwExpectError');
        dummyEnv = new jasmine_async_env_1.JasmineAsyncEnv();
    });
    it('Test setProp() can handle dot syntax on destination and source', function () {
        dummyEnv.currentBody = { address: { street: 'clifton' } };
        dummyEnv.setProp('address.street', 'address.street');
        expect(dummyEnv['address']['street']).toBe('clifton');
    });
    it('Test JasmineAsyncEnv.checkPropDoesntExist failing', function () {
        spyOn(object_utils_1.ObjectUtils, 'getProp').and.callThrough();
        dummyEnv.currentBody = { prop1: 'something' };
        dummyEnv.checkPropDoesntExist('prop1');
        expect(object_utils_1.ObjectUtils.getProp).toHaveBeenCalledWith(dummyEnv.currentBody, 'prop1');
        expect(throwExpectError).toHaveBeenCalled();
    });
    it('Test JasmineAsyncEnv.checkPropDoesntExist working', function () {
        spyOn(object_utils_1.ObjectUtils, 'getProp').and.callThrough();
        dummyEnv.currentBody = { prop1: 'something' };
        dummyEnv.checkPropDoesntExist('prop2');
        expect(object_utils_1.ObjectUtils.getProp).toHaveBeenCalledWith(dummyEnv.currentBody, 'prop2');
        expect(throwExpectError).not.toHaveBeenCalled();
    });
    it('Test isolated props example', function () {
        dummyEnv.prop1 = '1';
        dummyEnv.prop2 = '2';
        dummyEnv.prop3 = '3';
        dummyEnv.isolateEnvProperties('section1');
        expect(dummyEnv.prop1).toBeUndefined();
        expect(dummyEnv.prop2).toBeUndefined();
        expect(dummyEnv.prop3).toBeUndefined();
        expect(dummyEnv.getIsolate('section1').prop1).toBe('1');
        expect(dummyEnv.getIsolate('section1').prop2).toBe('2');
        expect(dummyEnv.getIsolate('section1').prop3).toBe('3');
    });
});
//# sourceMappingURL=jasmine-async-evn.spec.js.map