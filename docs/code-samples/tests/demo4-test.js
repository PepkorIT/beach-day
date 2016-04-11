var JasmineAsyncEnv = require("beach-day").JasmineAsyncEnv;
var RequestRunner   = require("beach-day").RequestRunner;
var CallConfig      = require("beach-day").CallConfig;

var baseURL         = "http://jsonplaceholder.typicode.com";

describe("Demo 4 - Adding data to a POST call", function(){

    // Async environment to link all tests
    var env = new JasmineAsyncEnv();


    // This test will run a basic HTTP call and ensure a status of 200
    // We also provide an assert function so we can run custom assertions
    it("Create new user", env.wrap(function(env){
        RequestRunner.run(new CallConfig({
            baseURL         : baseURL,
            endPoint        : "/users",
            method          : "POST",
            status          : 200,
            // The dataArr can hold objects and / or functions that will return data objects
            // When a call is made the array is iterated and functions are called to retrieve the data
            // Each data object is extended by the next building up the data to be sent
            // In this case we only have one
            dataArr         : [function(env, call){
                return {userId:1, title:"New Post", body:"Ipsum here"};
            }]
        }), env);
    }));
});