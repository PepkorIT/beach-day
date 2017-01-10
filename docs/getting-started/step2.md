# Beach-day Fundamentals

As an API testing framework one of the major requirements is to make a sequence of related HTTP calls that build up data and use that information in further HTTP calls. This mimics user interaction with an application. 
If there are any test failures in this sequence, we wouldn't want further calls to be executed as their data may depend on previous calls.

A Jasmine test has the following concepts:
- passed
- failed 
- skipped

With beach-day we add an additional concept:
- not run

"not run" means a test was not executed because a previous test failed. 

As Jasmine does not support this natively we introduce the `JasmineAsyncEnv` Object "Jasmine Asynchronous Environment" to help accomplish this.

We use a `JasmineAsyncEnv` Object to wrap test functions so they will only execute if all previous tests passed. 

> `JasmineAsyncEnv` is also used it to share information between tests, but more on that later.

Lets see what this looks like in code. Create a new file at `tests/demo2-test.js` and paste the following:

```javascript
var JasmineAsyncEnv = require("beach-day").JasmineAsyncEnv;

describe("Demo 2 - Adding an environment", function(){
    var world = {status:"all well"};

    // Async environment used to link all tests in this suite together
    var env = new JasmineAsyncEnv();

    // Basic test that wraps the test function with the env.wrap
    // This test will fail if you uncomment the TODO: below, causing all subsequent tests to fail too
    it("Ensure the world exists", env.wrap(function(env){
        expect(world).toBeDefined();
        // TODO: To see the result from a failed test uncomment this code
        // expect(world.status).toBe("exists");

        // All tests that use env.wrap() are automatically async
        // It is required to call the env.done() method to complete the test
        env.done();
    }));

    // Basic test 2 will not run because the previous test will fail
    it("Ensure all is well in the world", env.wrap(function(env){
        expect(world.status).toBe("all well");
        env.done();
    }));
});
```

Let's examine what happened in the code above:

 - We created a new `JasmineAsyncEnv` instance which is shared by all the tests in this suite.
 - We wrapped all test functions using env.wrap(). This will execute the passed function [asynchronously](http://jasmine.github.io/edge/introduction.html#section-Asynchronous_Support) and set the done function on the environment to be called when the test is complete.
 - Uncomment the TODO line in your first test to see it encounter an expect() failure, the second test will not be executed and have the status of "not run" in the report.

To run this and inspect the report (`reports/beach-day-report.html`):

```
node boot.js
```

### [>> Next: HTTP Calls - Running a GET](step3.md)

[<< Previous: Project and Environment Setup](step1.md)