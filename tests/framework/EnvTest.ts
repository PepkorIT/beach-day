import {JasmineAsyncEnv} from "../../lib/utils/JasmineAsyncEnv";

describe("Environment checks", function(){

    var env = new JasmineAsyncEnv();

    it("Env test failure", env.wrap(function(){
        expect(true).toBe(false);
        env.done();
    }));

    it("Expect this to not run", env.wrap(function(){
        expect("jon").toBe("jon");
        env.done();
    }))

});