var JasmineAsyncEnv = require("beach-day").JasmineAsyncEnv;
var RequestRunner   = require("beach-day").RequestRunner;
var CallConfig      = require("beach-day").CallConfig;

var baseURL         = "http://jsonplaceholder.typicode.com";

describe("Demo 5 - Adding HTTP call assertions", function(){

    // Async environment to link all tests
    var env = new JasmineAsyncEnv();

    // This test will run a basic HTTP call and ensure a status of 200
    // We also provide an assert function so we can run custom assertions
    it("Ensure all our resulting data is correct", env.wrap(function(env){
        RequestRunner.run(new CallConfig({
            baseURL         : baseURL,
            endPoint        : "/users/1",
            method          : "GET",
            status          : 200,
            // Every function in the assertFuncArr is called after a successful (non timeout) HTTP call
            assertFuncArr   : [function(env, call, body, res){
                // Basic assertion in pure jasmine style
                expect(body).toBeDefined();

                // Same assertion as before, the runner adds the body on the environment object
                expect(env.currentBody).toBeDefined();

                // This is a utility method on the environment that allows us to
                // assert existence of a property on the body response
                // It takes one string parameter that can use dot syntax and array selectors
                env.checkProp("address.geo.lat");

                // The checkProp will also return the value you are testing for if it exists
                // So you can assert it is of a specific value
                expect(env.checkProp("address.geo.lat")).toBe("-37.3159");

                // This should fail and give you an example output of a missing expected parameter
                env.checkProp("address.geo.latitude");
            }]
        }), env);
    }));
});