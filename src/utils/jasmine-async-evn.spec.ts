import {JasmineAsyncEnv} from './jasmine-async-env';
import {TestUtils} from './test-utils';
import {ObjectUtils} from './object-utils';

interface MockEnv extends JasmineAsyncEnv {
    prop1?:string;
    prop2?:string;
    prop3?:string;
}

describe('JasmineAsyncEnv Tests', function () {

    let dummyEnv:MockEnv,
        throwExpectError:jasmine.Spy;

    beforeEach(function () {
        throwExpectError = spyOn(TestUtils, 'throwExpectError');
        dummyEnv         = new JasmineAsyncEnv();
    });

    it('Test setProp() can handle dot syntax on destination and source', function () {
        dummyEnv.currentBody = {address: {street: 'clifton'}};
        dummyEnv.setProp('address.street', 'address.street');
        expect(dummyEnv['address']['street']).toBe('clifton');
    });

    it('Test JasmineAsyncEnv.checkPropDoesntExist failing', function () {
        spyOn(ObjectUtils, 'getProp').and.callThrough();
        dummyEnv.currentBody = {prop1: 'something'};
        dummyEnv.checkPropDoesntExist('prop1');

        expect(ObjectUtils.getProp).toHaveBeenCalledWith(dummyEnv.currentBody, 'prop1');
        expect(throwExpectError).toHaveBeenCalled();
    });

    it('Test JasmineAsyncEnv.checkPropDoesntExist working', function () {
        spyOn(ObjectUtils, 'getProp').and.callThrough();
        dummyEnv.currentBody = {prop1: 'something'};
        dummyEnv.checkPropDoesntExist('prop2');

        expect(ObjectUtils.getProp).toHaveBeenCalledWith(dummyEnv.currentBody, 'prop2');
        expect(throwExpectError).not.toHaveBeenCalled();
    });

    it('Test isolated props example', () => {
        dummyEnv.prop1 = '1';
        dummyEnv.prop2 = '2';
        dummyEnv.prop3 = '3';
        dummyEnv.isolateEnvProperties('section1');

        expect(dummyEnv.prop1).toBeUndefined();
        expect(dummyEnv.prop2).toBeUndefined();
        expect(dummyEnv.prop3).toBeUndefined();

        expect(dummyEnv.getIsolate<MockEnv>('section1').prop1).toBe('1');
        expect(dummyEnv.getIsolate<MockEnv>('section1').prop2).toBe('2');
        expect(dummyEnv.getIsolate<MockEnv>('section1').prop3).toBe('3');
    });
});
