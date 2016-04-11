var JasmineAsyncEnv = require("beach-day").JasmineAsyncEnv;
var RequestRunner   = require("beach-day").RequestRunner;
var CallConfig      = require("beach-day").CallConfig;

// This is a public API that is very dumb but helps to illustrate our examples
var baseURL         = "http://jsonplaceholder.typicode.com";

describe("Demo 3 - Running an HTTP call", function(){

    // Async environment to link all tests
    var env = new JasmineAsyncEnv();

    // This test will run a basic HTTP call and ensure a status of 200
    // If the status is anything other than 200 it will fail.
    // We pass the environment to the runner so it can
    // auto complete the test for us when done running.
    it("Ensure we get a simple result", env.wrap(function(env){
        RequestRunner.run(new CallConfig({
            baseURL     : baseURL,
            endPoint    : "/posts/1",
            method      : "GET",
            status      : 200
        }), env);
    }));
});