var BeachDay        = require("beach-day");
var JasmineAsyncEnv = BeachDay.JasmineAsyncEnv;
var RequestRunner   = BeachDay.RequestRunner;
var CallConfig      = BeachDay.CallConfig;

describe("Demo 4 - Running a POST", function(){

    var env = new JasmineAsyncEnv();

    it("Create a new post", env.wrap(function(env){
        RequestRunner.run(new CallConfig({
            baseURL         : "http://jsonplaceholder.typicode.com",
            endPoint        : "/posts",
            method          : "POST",
            dataArr         : [
                {userId:1},
                function(env, call){
                    return {userId:2, title:"New Post", body:"This post was created using: " + call.baseURL + call.endPoint};
                },
                {userId:3} // This will override userId from the first two
            ]
        }), env);
    }));
});