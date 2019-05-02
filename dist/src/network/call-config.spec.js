"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
describe('Config system used to power the framework calls', function () {
    var factory;
    var env = new index_1.JasmineAsyncEnv();
    beforeEach(function () {
        factory = new index_1.RequestRunner();
    });
    it('Build default config', function () {
        var assertSpy1 = jasmine.createSpy('assert1');
        var assertSpy2 = jasmine.createSpy('assert2');
        var obfuSpy1 = jasmine.createSpy('obfuSpy1');
        var obfuSpy2 = jasmine.createSpy('obfuSpy2');
        var checkRequestSchemaSpy = jasmine.createSpy('checkRequestSchemaSpy');
        var checkResponseSchemaSpy = jasmine.createSpy('checkResponseSchemaSpy');
        var defaultConfig = new index_1.CallConfig({
            baseURL: 'http://www.something.com//',
            assertFuncArr: [assertSpy1],
            dataArr: [{ id: 1 }],
            obfuscateArr: [obfuSpy1],
            headers: { param1: '1' },
            headersArr: [{ param2: '2' }],
            checkRequestSchemaFunc: checkRequestSchemaSpy,
            checkResponseSchemaFunc: checkResponseSchemaSpy,
            checkRequestSchema: true,
            checkResponseSchema: true
        });
        var config = defaultConfig.extend({
            endPoint: '/fetch/user',
            assertFuncArr: [assertSpy2],
            dataArr: [function (env) {
                    return { name: 'jon' };
                }],
            obfuscateArr: [obfuSpy2],
            headersArr: [function (env, call) {
                    return { param2: '3' };
                }]
        });
        expect(config.baseURL).toBe(defaultConfig.baseURL);
        expect(config.endPoint).toBe('/fetch/user');
        expect(config.getFullURL(env)).toBe('http://www.something.com/fetch/user');
        // Check data expansion
        var data = config.getDataImpl(env);
        expect(data['id']).toBe(1);
        expect(data['name']).toBe('jon');
        // Check headers expansion with depricated property
        var headers = config.getHeadersImpl(env);
        expect(headers.param1).toBe('1');
        expect(headers.param2).toBe('3');
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
    it('Test that the extension is working', function () {
        var defaultConfig = new index_1.CallConfig({});
        var callConfig = new index_1.CallConfig({ testName: 'something' });
        index_1.console.log('Using call config in test: ', callConfig);
        var useConfig = defaultConfig.extend(callConfig);
        expect(useConfig.testName).toBe('something');
    });
    it('Test object extension', function () {
        var configOne = new index_1.CallConfig();
        var configTwo = new index_1.CallConfig({ headers: { age: '10', name: 'hello' }, requestOptions: { qs: '123', json: false } });
        var configThree = new index_1.CallConfig({ headers: { age: '12' }, requestOptions: { json: true } });
        var useConfig = configOne.extend(configTwo).extend(configThree);
        expect(useConfig.headers.name).toBe('hello');
        expect(useConfig.headers.age).toBe('12');
        expect(useConfig.requestOptions.qs).toBe('123');
        expect(useConfig.requestOptions.json).toBe(true);
    });
    it('Ensure no extension leakage', function () {
        var configOne = new index_1.CallConfig({ dataArr: [{ id: '1' }] });
        var configTwo = new index_1.CallConfig({ dataArr: [{ id: '2' }] });
        var configThree = new index_1.CallConfig({ dataArr: [{ id: '3' }] });
        var useConfig = configOne.extend(configTwo).extend(configThree);
        expect(useConfig.getDataImpl(new index_1.JasmineAsyncEnv()).id).toBe('3');
        index_1.console.log('configOne: ', configOne.dataArr);
        index_1.console.log('configTwo: ', configTwo.dataArr);
        index_1.console.log('configThree: ', configThree.dataArr);
        expect(configOne.dataArr[0].id).toBe('1');
        expect(configTwo.dataArr[0].id).toBe('2');
        expect(configThree.dataArr[0].id).toBe('3');
    });
    it('Ensure boolean overrides working', function () {
        var configOne = new index_1.CallConfig({ checkResponseSchema: false });
        var defaultConfig = new index_1.CallConfig({ checkResponseSchema: true });
        var globalDefault = new index_1.CallConfig({});
        var useConfig = defaultConfig.extend(configOne);
        useConfig = globalDefault.extend(useConfig);
        expect(useConfig.checkResponseSchema).toEqual(false);
    });
    it('Ensure baseURL combinations work', function () {
        var config = new index_1.CallConfig({
            baseURL: 'www.tester.com',
            endPoint: '/something'
        });
        expect(config.getFullURL(env)).toBe('www.tester.com/something');
        // Change baseURL to a function
        config.baseURL = function (env) {
            return 'www.potato.co.za/';
        };
        expect(config.getFullURL(env)).toBe('www.potato.co.za/something');
        // Change endPoint to a function
        config.endPoint = function (env) {
            return '//carpet';
        };
        expect(config.getFullURL(env)).toBe('www.potato.co.za/carpet');
    });
    it('Ensure no leakage in headers', function () {
        var config1 = new index_1.CallConfig({
            headers: { option1: '123' }
        });
        var config2 = new index_1.CallConfig().extend(config1);
        // now update config2
        config2.headers.option1 = '456';
        expect(config1.headers.option1).toBe('123');
    });
    it('Ensure no leakage in array properties', function () {
        var config1 = new index_1.CallConfig({
            dataArr: ['1']
        });
        var config2 = new index_1.CallConfig().extend(config1);
        // now update config2
        config2.dataArr.push('2');
        expect(config1.dataArr.length).toBe(1);
    });
    it('old school only headers should still be returned', function () {
        var config = new index_1.CallConfig({
            headers: { param1: '1' }
        });
        expect(config.getHeadersImpl(env).param1).toBe('1');
    });
    it('headers obj shouldn\'t leak into data', function () {
        var config1 = new index_1.CallConfig({ headers: { param1: '1' } });
        var config2 = new index_1.CallConfig({
            dataArr: [function () {
                    return { dataParam: '2' };
                }]
        });
        var useConfig = config1.extend(config2);
        var dataResult = useConfig.getDataImpl(env);
        expect(dataResult.param1).toBeUndefined();
    });
});
//# sourceMappingURL=call-config.spec.js.map