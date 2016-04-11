# Adding a test environment (Step 2)
Now that we have a basic jasmine test in place and we have seen how to run and generate our beach-day report. Lets dive in a bit deeper to understand some of the utilities of the framework.

As an HTTP testing framework one of the major requirements is to make a sequence of related HTTP calls that build up information and use that information in further HTTP calls. This mimics user interaction a consumer application. 
Additionally if there are any test failures in this sequence, we wouldn't want any further calls to be executed after a failure as their data may depend on previous calls.

A jasmine test has the concepts of: passed, failed and skipped. With beach-day we add an additional concept of not run. Basically this means that a test was not executed at all because a previous test had failed.

As jasmine does not support these abilities natively we introduce the JasmineAsyncEnv class also referred to as the environment to help accomplish them.

We can use an environment to wrap test functions so they will only execute if all the tests before it have passed. 
Additionally we can use it to share information from tests to another.

Lets create a new test file example of this at `tests/demo2-test.js`:
```javascript
// Here we import the JasmineAsyncEnv class from the beach-day module
var JasmineAsyncEnv = require("beach-day").JasmineAsyncEnv;

describe("Demo 2 - Adding an environment", function(){

    // Simple test data
    var world = {status:"all well"};

    // Async environment used to link all tests in this suite together
    var env = new JasmineAsyncEnv();

    // Basic test 1 that wraps the test function with the env.wrap
    // this should now fail, causing all subsequent tests to fail too
    it("Ensure the world exists", env.wrap(function(){
        expect(world).toBeDefined();
        expect(world.status).toBe("exists");

        // All tests that use env.wrap() are automatically async
        // It is required to call the env.done() method to complete the test
        env.done();
    }));

    // Basic test 2 will not run because the previous test will will fail
    it("Ensure all is well in the world", env.wrap(function(){
        expect(world.status).toBe("all well");
        env.done();
    }));
});
```

So what has happened here? We have created a new JasmineAsyncEnv which will be shared by all the tests in this suite. We have wrapped all the test functions using env.wrap(). This will execute the passed function [asynchronously](http://jasmine.github.io/edge/introduction.html#section-Asynchronous_Support) and set the done function on the environment to be called when the test is complete.
As the first test will encounter an expect() failure, the second test will not be executed and have the status of "not run" 

To run your new test use `node boot.js`.

[< Previous Step](step1.md) | [Next Step >](step3.md)