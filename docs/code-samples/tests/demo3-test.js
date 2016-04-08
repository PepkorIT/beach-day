var JasmineAsyncEnv = require("beach-day").JasmineAsyncEnv;
var RequestRunner   = require("beach-day").RequestRunner;
var CallConfig      = require("beach-day").CallConfig;

var baseURL         = "http://jsonplaceholder.typicode.com";

describe("Demo 3", function(){

    // Simple test data
    var world = {status:"all well"};

    // Async environment to link all tests
    var env = new JasmineAsyncEnv();

    // This test will run a basic HTTP call and ensure a status of 200
    // If the status is anything other than 200 it will fail.
    // We pass the environment to the runner so it can
    // auto complete the test for us when done running.
    it("Ensure the world exists", env.wrap(function(env){
        RequestRunner.run(new CallConfig({
            baseURL     : baseURL,
            endPoint    : "/posts/1",
            method      : "GET",
            status      : 200
        }), env);
    }));
    
    it("Ensure all is well in the world", env.wrap(function(){
        expect(world.status).toBe("all well");
        env.done();
    }));
});