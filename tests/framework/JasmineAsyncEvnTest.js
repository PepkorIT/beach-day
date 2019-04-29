"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JasmineAsyncEnv_1 = require("../../lib/utils/JasmineAsyncEnv");
var TestUtils_1 = require("../../lib/utils/TestUtils");
var ObjectUtils_1 = require("../../lib/utils/ObjectUtils");
describe('JasmineAsyncEnv Tests', function () {
    var dummyEnv, throwExpectError, getProp;
    beforeEach(function () {
        throwExpectError = jasmine.createSpy('throwExpectError');
        TestUtils_1.TestUtils.throwExpectError = throwExpectError;
        dummyEnv = new JasmineAsyncEnv_1.JasmineAsyncEnv();
    });
    it('Test setProp() can handle dot syntax on destination and source', function () {
        dummyEnv.currentBody = { address: { street: 'clifton' } };
        dummyEnv.setProp('address.street', 'address.street');
        expect(dummyEnv['address']['street']).toBe('clifton');
    });
    it('Test JasmineAsyncEnv.checkPropDoesntExist failing', function () {
        spyOn(ObjectUtils_1.default, 'getProp').and.callThrough();
        dummyEnv.currentBody = { prop1: 'something' };
        dummyEnv.checkPropDoesntExist('prop1');
        expect(ObjectUtils_1.default.getProp).toHaveBeenCalledWith(dummyEnv.currentBody, 'prop1');
        expect(throwExpectError).toHaveBeenCalled();
    });
    it('Test JasmineAsyncEnv.checkPropDoesntExist working', function () {
        spyOn(ObjectUtils_1.default, 'getProp').and.callThrough();
        dummyEnv.currentBody = { prop1: 'something' };
        dummyEnv.checkPropDoesntExist('prop2');
        expect(ObjectUtils_1.default.getProp).toHaveBeenCalledWith(dummyEnv.currentBody, 'prop2');
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
