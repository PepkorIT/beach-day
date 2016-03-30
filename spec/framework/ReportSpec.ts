import { JasmineAsyncEnv, console } from "../../lib/index";

describe("Category 1", function(){

    var env = new JasmineAsyncEnv();

    it("Run async test", env.wrap(function(env){
        expect("jon").toBe("jon");
        var logObj      = {name:"jon", circle:null};
        logObj.circle   = logObj;
        console.log("Something going to be logged out", logObj);
        setTimeout(env.done, 100);
    }));

    it("1: Test something that is gonna throw an error", env.wrap(function(env) {
        this["expected"](false).toBe(true);
        env.done();
    }));

    it("1: Test something that is gonna expect fail", env.wrap(function(env){
        expect(false).toBe(true);
        env.done();
    }));

    describe("Child block", function(){

        it("Run test 1", env.wrap(function(env){
            expect("jon").toBe("jon");
            expect("Beech").toBe("beech");
            env.done();
        }));

        xit("Skipped test", env.wrap(function(env){
            expect("jon").toBe("Jon");
            env.done();
        }));

    });
});

