# Adding data to a POST call (Step 4)

We have seen how to setup basic GET tests lets add a POST call with some data attached.

Data is setup for an HTTP call using the `CallConfig dataArr` property. This array can hold any amount of objects or functions to return objects.

When an HTTP call is made this array is iterated and objects are extended one over the next to build up a final object to send with the call. By default the framework will use `JSON.stringify()` for serialise the data before making the call, if you want to override this you can set the `CallConfig dataSerialisationFunc` property.

Lets create a new test file example of this at `tests/demo4-test.js`:
```javascript
// Here we import the three required classes from the beach-day module
var JasmineAsyncEnv = require("beach-day").JasmineAsyncEnv;
var RequestRunner   = require("beach-day").RequestRunner;
var CallConfig      = require("beach-day").CallConfig;

// This is a public API that is very dumb but helps to illustrate our examples
var baseURL         = "http://localhost:3000";

describe("Demo 4 - Adding data to a POST call", function(){

    // Async environment to link all tests
    var env = new JasmineAsyncEnv();


    // This test will run a basic HTTP call
    // We also provide an assert function so we can run custom assertions
    it("Create new user", env.wrap(function(env){
        RequestRunner.run(new CallConfig({
            baseURL         : baseURL,
            endPoint        : "/users",
            method          : "POST",
            // The dataArr can hold objects and / or functions that will return data objects
            // When a call is made the array is iterated and functions are called to retrieve the data
            // Each data object is extended by the next building up the data to be sent
            // In this case we only have one
            dataArr         : [function(env, call){
                return {userId:1, title:"New Post", body:"Ipsum here"};
            }]
        }), env);
    }));
});
```


So lets examine what has happened in the above test. 

 - We have made a new HTTP call using the call config, this time using the "POST" method type.
 - We have added a function to return data using the dataArr
 - This call will be run sending the object return in the dataArr function as a JSON string to the server




### [Previous Step](step3.md) | [Next Step](step5.md)