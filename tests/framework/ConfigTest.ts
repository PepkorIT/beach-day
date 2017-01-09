import {RequestRunner, CallConfig, JasmineAsyncEnv, console} from "../../lib/index";


describe("Config system used to power the framework calls", function(){
    var factory:RequestRunner;
    var env = new JasmineAsyncEnv();

    beforeEach(function(){
        factory = new RequestRunner();
    });

    it("Build default config", function(){
        var assertSpy1              = jasmine.createSpy("assert1");
        var assertSpy2              = jasmine.createSpy("assert2");
        var obfuSpy1                = jasmine.createSpy("obfuSpy1");
        var obfuSpy2                = jasmine.createSpy("obfuSpy2");
        var checkRequestSchemaSpy   = jasmine.createSpy("checkRequestSchemaSpy");
        var checkResponseSchemaSpy  = jasmine.createSpy("checkResponseSchemaSpy");

        var defaultConfig = new CallConfig({
            baseURL                 : "http://www.something.com//",
            assertFuncArr           : [assertSpy1],
            dataArr                 : [{id:1}],
            obfuscateArr            : [obfuSpy1],
            checkRequestSchemaFunc  : checkRequestSchemaSpy,
            checkResponseSchemaFunc : checkResponseSchemaSpy,
            checkRequestSchema      : true,
            checkResponseSchema     : true
        });

        console.log("----------------------> Extend");
        var config = defaultConfig.extend({
            endPoint        : "/fetch/user",
            assertFuncArr   : [assertSpy2],
                dataArr         : [function(env:JasmineAsyncEnv){
                return {name:"jon"};
            }],
            obfuscateArr    : [obfuSpy2]
        });

        expect(config.baseURL).toBe(defaultConfig.baseURL);
        expect(config.endPoint).toBe("/fetch/user");
        expect(config.getFullURL(env)).toBe("http://www.something.com/fetch/user");

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
        var callConfig      = new CallConfig({testName:"something"});
        console.log("Using call config in test: ", callConfig);
        var useConfig       = defaultConfig.extend(callConfig);
        expect(useConfig.testName).toBe("something");
    });

    it("Test object extension", function(){
        var configOne       = new CallConfig();
        var configTwo       = new CallConfig({headers:{age:"10", name:"hello"}, requestOptions:{qs:"123", json:false}});
        var configThree     = new CallConfig({headers:{age:"12"}, requestOptions:{json:true}});
        var useConfig       = configOne.extend(configTwo).extend(configThree);
        expect(useConfig.headers.name).toBe("hello");
        expect(useConfig.headers.age).toBe("12");
        expect(useConfig.requestOptions.qs).toBe("123");
        expect(useConfig.requestOptions.json).toBe(true);
    });

    it("Ensure no extension leakage", function(){
        var configOne       = new CallConfig({dataArr:[{id:"1"}]});
        var configTwo       = new CallConfig({dataArr:[{id:"2"}]});
        var configThree     = new CallConfig({dataArr:[{id:"3"}]});
        var useConfig       = configOne.extend(configTwo).extend(configThree);

        expect(useConfig.getDataImpl(new JasmineAsyncEnv()).id).toBe("3");

        console.log("configOne: ", configOne.dataArr);
        console.log("configTwo: ", configTwo.dataArr);
        console.log("configThree: ", configThree.dataArr);

        expect(configOne.dataArr[0].id).toBe("1");
        expect(configTwo.dataArr[0].id).toBe("2");
        expect(configThree.dataArr[0].id).toBe("3");
    });

    it("Ensure boolean overrides working", function(){
        var configOne       = new CallConfig({checkResponseSchema:false});
        var defaultConfig   = new CallConfig({checkResponseSchema:true});
        var globalDefault   = new CallConfig({});

        var useConfig       = defaultConfig.extend(configOne);
        useConfig           = globalDefault.extend(useConfig);
        expect(useConfig.checkResponseSchema).toEqual(false);
    });

    it("Ensure baseURL combinations work", function(){
        var config = new CallConfig({
            baseURL     : "www.tester.com",
            endPoint    : "/something"
        });
        expect(config.getFullURL(env)).toBe("www.tester.com/something");

        // Change baseURL to a function
        config.baseURL = function(env:JasmineAsyncEnv) {
            return "www.potato.co.za/";
        };
        expect(config.getFullURL(env)).toBe("www.potato.co.za/something");

        // Change endPoint to a function
        config.endPoint = function(env:JasmineAsyncEnv) {
            return "//carpet";
        };
        expect(config.getFullURL(env)).toBe("www.potato.co.za/carpet");
    });

    it("Ensure call is passed to all IDataFunc methods", function() {
        let passedInCallObject;
        let testConfig = new CallConfig({
            baseURL         : "http://jsonplaceholder.typicode.com",
            endPoint        : "/posts",
            method          : "POST",
            dataArr         : [
                (env, call) => {
                    passedInCallObject = call;
                    return {};
                }
            ]
        });
        testConfig.getDataImpl(env);
        expect(passedInCallObject).toBe(testConfig);
    });
});