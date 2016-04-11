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