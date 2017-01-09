var BeachDay        = require("beach-day");
var JasmineAsyncEnv = BeachDay.JasmineAsyncEnv;
var RequestRunner   = BeachDay.RequestRunner;
var CallConfig      = BeachDay.CallConfig;

var env = new JasmineAsyncEnv();

RequestRunner.globalDefaults = new CallConfig({
    baseURL       : "http://jsonplaceholder.typicode.com",
    assertFuncArr : [function(env, call, body, res){
        if (call.hasOwnProperty("statusCode")){
            expect(res.statusCode).toBe(call.statusCode);
        }
    }]
});

describe("Demo 7 - Config defaults and extension", function(){
    it("Run get users", env.wrap(function(env){
        RequestRunner.run(new CallConfig({
            endPoint : "/users/1",
            statusCode  : 200
        }), env);
    }));
});