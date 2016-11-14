# Assertions & sharing data between calls

We've seen how to setup and write basic GET and POST calls, now lets bring in assertions to really test our API.

Like everything else in beach-day the assertions are also typed onto the CallConfig object.
The `CallConfig.assertFuncArr` property takes an array of functions that will be executed after a successful HTTP call.

The `JasmineAsyncEnv` object is passed to each function allowing you to share data between tests. Additionally the `JasmineAsyncEnv` comes with some utility methods `(checkProp() & setProp())` to help make assertions easier.

Create a new file `tests/demo5-test.js` and paste the following:
```javascript
var BeachDay        = require("beach-day");
var JasmineAsyncEnv = BeachDay.JasmineAsyncEnv;
var RequestRunner   = BeachDay.RequestRunner;
var CallConfig      = BeachDay.CallConfig;

var baseURL         = "http://jsonplaceholder.typicode.com";

describe("Demo 5 - Adding HTTP call assertions & environment variables", function(){

    var env = new JasmineAsyncEnv();

    it("Ensure returned data is correct", env.wrap(function(env){
        RequestRunner.run(new CallConfig({
            baseURL  : baseURL,
            endPoint : "/users",
            method   : "GET",
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


    // In this test we simply fetch a user using an environment variable and ensure a result
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
```

Let's examine what happened in the code above:
 - In the first test we used the checkProp() method to run a number of assertions on the data returned
 - We added some of the response data onto the environment for use in the next call
 - Lastly, we made a second call utilising the data on the environment to generate part of the config


### [>> Next: JSON Schema validation (Swagger or equivalent)](step6.md)

[<< Previous: HTTP Calls - Running a GET](step4.md)