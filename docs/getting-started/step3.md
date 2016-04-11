# Running an HTTP call (Step 3)

Now that we have covered adding an environment to our tests, lets look at running an actual HTTP call.

As a HTTP functional testing framework beach-day obviously has the requirement of being able to make HTTP calls to a server. node can do this natively with its APIs but would require a lot of boilerplate code for every test.
Therefore beach-day utilises a framework under the hood called [request](https://github.com/request/request) to simplify this process.

Built on top of request, beach-day provides a set of config & utilities to help write tests with very little code and make assertions on the data returned a breeze.

The idea here is you can create a single config object that represents an HTTP call and all the assertions for that call. This makes the code required to generate a basic test rather small.

This process manifests in the form of two classes: the `CallConfig` which defines all the config for an HTTP call and the `RequestRunner` which does the execution of the call, taking a config object and an environment.

Lets create a new test file example of this at `tests/demo3-test.js`:
```javascript
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
```


So lets examine what has happened in the above test. 

 - We imported all CallConfig and RequestRunner classes so they could be used in the test. 
 - We used a public testing API so that our test actually makes an HTTP call. 
 - We defined a new config object with the properties to make a GET /posts/1 call
 - We executed the config using the runner passing it the config and the environment. 

When the runner executes the call, the one assertion it will make for us automatically is the status of the HTTP call.

> As a convention it is recommended to keep it to 1 HTTP per jasmine test but there may be exceptions to this for instance if you wanted to run a poll till a certain value has changed.
> It is up to the developer to make this decision but recommended to use 1 test per call

### [Previous Step](step2.md) | [Next Step](step4.md)