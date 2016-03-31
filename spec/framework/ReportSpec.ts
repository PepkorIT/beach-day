import { JasmineAsyncEnv, console } from "../../lib/index";
import * as request from "request";

describe("Category 1", function(){

    var env = new JasmineAsyncEnv();

    it("Run async test", env.wrap(function(env){
        expect("jon").toBe("jon");
        var logObj      = {name:"jon", circle:null};
        logObj.circle   = logObj;
        console.log("Something going to be logged out", logObj);
        setTimeout(env.done, 10);
    }));

    it("Run an assertion that will show", env.wrap(function(env) {
        expect("this").toBe("that");
        expect("someone").toBe("there");
        expect("anyone").toBe("there");
        console.log("Some data from the test here...");
        env.done();
    }));

    it("Test something that is gonna expect fail", env.wrap(function(env){
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

        describe("Further inner suite", function(){
            it("Test something", env.wrap(function(env){
                env.done();
            }))
        })

    });
});

describe("Category 2", function(){

    var env2 = new JasmineAsyncEnv();

    it("Run async test", env2.wrap(function(env){
        expect("jon").toBe("jon");
        var logObj      = {name:"jon", circle:null};
        logObj.circle   = logObj;
        console.log("Something going to be logged out", logObj);
        setTimeout(env.done, 10);
    }));

    it("Test something that is gonna throw an error", env2.wrap(function(env) {
        this["expected"](false).toBe(true);
        env.done();
    }));
});