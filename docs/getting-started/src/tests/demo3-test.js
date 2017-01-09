var BeachDay        = require("beach-day");
var JasmineAsyncEnv = BeachDay.JasmineAsyncEnv;
var RequestRunner   = BeachDay.RequestRunner;
var CallConfig      = BeachDay.CallConfig;

describe("Demo 3 - Running an HTTP call", function(){

    var env = new JasmineAsyncEnv();

    it("Ensure we get a simple result", env.wrap(function(env){
        RequestRunner.run(new CallConfig({
            baseURL     : "http://jsonplaceholder.typicode.com",
            endPoint    : "/posts/1",
            method      : "GET"
        }), env); // The RequestRunner will run env.done() for us automatically
    }));
});