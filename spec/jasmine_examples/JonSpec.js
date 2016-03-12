var BeachDay = require("../../index.js");

describe("Category 1", function(){

    var env = new BeachDay.JasmineAsyncEnv();

    it ("1: Test something that is gonna throw an error", env.wrap(function(env){
        expected(false).toBe(true);
        env.done();
    }));

    it ("1: Test something that is gonna expect fail", env.wrap(function(env){
        expect(false).toBe(true);
        env.done();
    }));

    describe("Child block", function(){

        it("Run test 1", env.wrap(function(env){
            expect("jon").toBe("jon");
            expect("Beech").toBe("beech");
            env.failed = true;
            env.done();
        }));

        it("Run test 2", env.wrap(function(env){
            expect("jon").toBe("Jon");
            env.done();
        }));

    });
});

