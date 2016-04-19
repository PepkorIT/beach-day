var JasmineAsyncEnv = require("beach-day").JasmineAsyncEnv;
var RequestRunner   = require("beach-day").RequestRunner;
var CallConfig      = require("beach-day").CallConfig;

var baseURL         = "http://localhost:3000";

describe("Demo 5 - Adding HTTP call assertions & environment variables", function(){

    // Async environment to link all tests
    var env = new JasmineAsyncEnv();

    // This test will run a basic HTTP call
    // We also provide an assert function so we can run custom assertions
    it("Ensure all our resulting data is correct", env.wrap(function(env){
        RequestRunner.run(new CallConfig({
            baseURL         : baseURL,
            endPoint        : "/users",
            method          : "GET",
            // Every function in the assertFuncArr is called after a successful (non timeout) HTTP call
            // In here you can write any custom assertions you want to make about the response
            // You can also use this place to store any data from the response onto the environment for later use
            assertFuncArr   : [function(env, call, body, res){
                // Basic assertion in pure jasmine style
                expect(body).toBeDefined();

                // Same assertion as before, the runner adds the body on the environment object
                expect(env.currentBody).toBeDefined();

                // Make sure the response status code is correct
                expect(res.statusCode).toBe(200);

                // This is a utility method on the environment that allows us to
                // assert existence of a property on the response body
                // It takes one string parameter that can use dot syntax and array selectors
                // This avoids runtime errors when trying to access properties that don't exist
                env.checkProp("[0].address.geo.lat");

                // The checkProp will also return the value you are testing, if it exists
                // So you can assert it is of a specific value
                expect(env.checkProp("[0].address.geo.lat")).toBe("-37.3159");

                // This will fail and give you an example output of a missing expected parameter
                // Uncomment to test
                //env.checkProp("[0].address.geo.latitude");

                // Finally lets store an id on the environment for use in a later test
                // Here we use the setProp method which will set a property on the environment if it exists in the data
                // Again we use a string based accessor to avoid runtime errors
                env.setProp("userId", "[0].id");

                // Alternative we could have used this, but it may cause a runtime error if there are no users returned
                //env.id = body[0].id;
            }]
        }), env);
    }));


    // In this test we simply fetch a user using an environment variable and ensure a result.
    it("Fetch a single user", env.wrap(function(env){
        RequestRunner.run(new CallConfig({
            baseURL         : baseURL,
            endPoint        : "/users/" + env["userId"],
            method          : "GET",
            assertFuncArr   : [function(env, call, body, res){
                // Basic assertion in pure jasmine style
                expect(body).toBeDefined();
            }]
        }), env);
    }));
});