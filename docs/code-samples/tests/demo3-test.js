var JasmineAsyncEnv = require("beach-day").JasmineAsyncEnv;
var RequestRunner   = require("beach-day").RequestRunner;
var CallConfig      = require("beach-day").CallConfig;

var baseURL         = "http://jsonplaceholder.typicode.com";

describe("Demo 3", function(){

    // Simple test data
    var world = {status:"all well"};

    // Async environment to link all tests
    var env = new JasmineAsyncEnv();

    // Basic test 1 that wraps the test function with the env.wrap
    // this should now fail, causing all subsequent tests to fail too
    it("Ensure the world exists", env.wrap(function(env){
        RequestRunner.run(new CallConfig({
            baseURL     : baseURL,
            endPoint    : "/posts/1",
            method      : "GET"
        }), env);
    }));

    // Basic test 2 will not run because the previous test will will fail
    it("Ensure all is well in the world", env.wrap(function(){
        expect(world.status).toBe("all well");
    }));
});