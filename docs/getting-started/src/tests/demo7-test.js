var JasmineAsyncEnv = require("beach-day").JasmineAsyncEnv;
var RequestRunner   = require("beach-day").RequestRunner;
var CallConfig      = require("beach-day").CallConfig;

var baseURL         = "http://localhost:3000";



// Here we setup the globalDefaults for the entire project
// These defaults will be used as a base for all CallConfig objects passed to RequestRunner.run()
// This is written outside of the test to illustrate it can easily come from an external
// file and be require()'d into each test file.
// We simply set some basic defaults we know will be the same for every call
RequestRunner.globalDefaults = new CallConfig({
    checkResponseSchema : true,
    checkRequestSchema  : true,
    method              : "GET",

    // Here we add a default assert function that will be applied to every config object
    // It looks for a statusCode property and if present ensures the call respondes with that status code
    assertFuncArr       : [function(env, call, body, res){
        if (call.hasOwnProperty("statusCode")){
            expect(res.statusCode).toBe(call.statusCode);
        }
    }]
});




describe("Demo 7 - Config defaults and extension", function(){

    // Here we create a default config we can base our tests off
    // This config will need to be manually extended to be used
    // unlike the above globalDefaults which are automatically extended when calling RequestRunner.run()
    var defaultConfig = new CallConfig({
        // We set the baseURL as all the calls in this suite will run off the same service
        baseURL     : baseURL,

        // We set a default status code to be checked by the RequestRunner.globalDefaults assertFunc
        // This can easily be overridden if needed
        // You can change this to something else to see this test fail in the report
        statusCode  : 200
    });

    var env = new JasmineAsyncEnv();

    // Now that we are utilising the config extension the test body verbosity drops substantially
    // If you wanted you could reduce this even more by creating a utility to generate tests
    it("Run get users", env.wrap(function(env){
        RequestRunner.run(defaultConfig.extend({
            endPoint : "/users/1",
        }), env);
    }));
});