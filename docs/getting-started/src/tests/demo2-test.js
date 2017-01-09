var JasmineAsyncEnv = require("beach-day").JasmineAsyncEnv;

describe("Demo 2 - Adding an environment", function(){
    var world = {status:"all well"};

    // Async environment used to link all tests in this suite together
    var env = new JasmineAsyncEnv();

    // Basic test that wraps the test function with the env.wrap
    // This test will fail if you uncomment the TODO below, causing all subsequent tests to fail too
    it("Ensure the world exists", env.wrap(function(env){
        expect(world).toBeDefined();
        // TODO To see the result from a failed test uncomment this code
        //expect(world.status).toBe("exists");

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