import {RequestRunner, CallConfig, JasmineAsyncEnv, console} from "../../index";


describe("Config system used to power the framework calls", function(){
    let factory:RequestRunner;
    let env = new JasmineAsyncEnv();

    beforeEach(function(){
        factory = new RequestRunner();
    });

    it("Build default config", function(){
        let assertSpy1              = jasmine.createSpy("assert1");
        let assertSpy2              = jasmine.createSpy("assert2");
        let obfuSpy1                = jasmine.createSpy("obfuSpy1");
        let obfuSpy2                = jasmine.createSpy("obfuSpy2");
        let checkRequestSchemaSpy   = jasmine.createSpy("checkRequestSchemaSpy");
        let checkResponseSchemaSpy  = jasmine.createSpy("checkResponseSchemaSpy");

        let defaultConfig = new CallConfig({
            baseURL                 : "http://www.something.com//",
            assertFuncArr           : [assertSpy1],
            dataArr                 : [{id:1}],
            obfuscateArr            : [obfuSpy1],
            headers                 : {param1:"1"},
            headersArr              : [{param2:"2"}],
            checkRequestSchemaFunc  : checkRequestSchemaSpy,
            checkResponseSchemaFunc : checkResponseSchemaSpy,
            checkRequestSchema      : true,
            checkResponseSchema     : true
        });

        let config = defaultConfig.extend({
            endPoint        : "/fetch/user",
            assertFuncArr   : [assertSpy2],
            dataArr         : [function(env:JasmineAsyncEnv){
                return {name:"jon"};
            }],
            obfuscateArr    : [obfuSpy2],
            headersArr      : [function(env: JasmineAsyncEnv, call: CallConfig){
                return {param2:"3"};
            }]
        });

        expect(config.baseURL).toBe(defaultConfig.baseURL);
        expect(config.endPoint).toBe("/fetch/user");
        expect(config.getFullURL(env)).toBe("http://www.something.com/fetch/user");

        // Check data expansion
        let data = config.getDataImpl(env);
        expect(data["id"]).toBe(1);
        expect(data["name"]).toBe("jon");

        // Check headers expansion with depricated property
        let headers = config.getHeadersImpl(env);
        expect(headers.param1).toBe("1");
        expect(headers.param2).toBe("3");

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
        let defaultConfig   = new CallConfig({});
        let callConfig      = new CallConfig({testName:"something"});
        console.log("Using call config in test: ", callConfig);
        let useConfig       = defaultConfig.extend(callConfig);
        expect(useConfig.testName).toBe("something");
    });

    it("Test object extension", function(){
        let configOne       = new CallConfig();
        let configTwo       = new CallConfig({headers:{age:"10", name:"hello"}, requestOptions:{qs:"123", json:false}});
        let configThree     = new CallConfig({headers:{age:"12"}, requestOptions:{json:true}});
        let useConfig       = configOne.extend(configTwo).extend(configThree);
        expect(useConfig.headers.name).toBe("hello");
        expect(useConfig.headers.age).toBe("12");
        expect(useConfig.requestOptions.qs).toBe("123");
        expect(useConfig.requestOptions.json).toBe(true);
    });

    it("Ensure no extension leakage", function(){
        let configOne       = new CallConfig({dataArr:[{id:"1"}]});
        let configTwo       = new CallConfig({dataArr:[{id:"2"}]});
        let configThree     = new CallConfig({dataArr:[{id:"3"}]});
        let useConfig       = configOne.extend(configTwo).extend(configThree);

        expect(useConfig.getDataImpl(new JasmineAsyncEnv()).id).toBe("3");

        console.log("configOne: ", configOne.dataArr);
        console.log("configTwo: ", configTwo.dataArr);
        console.log("configThree: ", configThree.dataArr);

        expect(configOne.dataArr[0].id).toBe("1");
        expect(configTwo.dataArr[0].id).toBe("2");
        expect(configThree.dataArr[0].id).toBe("3");
    });

    it("Ensure boolean overrides working", function(){
        let configOne       = new CallConfig({checkResponseSchema:false});
        let defaultConfig   = new CallConfig({checkResponseSchema:true});
        let globalDefault   = new CallConfig({});

        let useConfig       = defaultConfig.extend(configOne);
        useConfig           = globalDefault.extend(useConfig);
        expect(useConfig.checkResponseSchema).toEqual(false);
    });

    it("Ensure baseURL combinations work", function(){
        let config = new CallConfig({
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

    it("Ensure no leakage in headers", function(){
        let config1 = new CallConfig({
            headers: {option1:"123"}
        });
        let config2 = new CallConfig().extend(config1);

        // now update config2
        config2.headers.option1 = "456";

        expect(config1.headers.option1).toBe("123");
    });

    it("Ensure no leakage in array properties", function(){
        let config1 = new CallConfig({
            dataArr: ["1"]
        });
        let config2 = new CallConfig().extend(config1);

        // now update config2
        config2.dataArr.push("2");

        expect(config1.dataArr.length).toBe(1);
    });
});