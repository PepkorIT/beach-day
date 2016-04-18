var JasmineAsyncEnv = require("beach-day").JasmineAsyncEnv;
var RequestRunner   = require("beach-day").RequestRunner;
var CallConfig      = require("beach-day").CallConfig;

// Lets pull in the TestUtils lib
// This has utility method for running schema validations
var TestUtils       = require("beach-day").TestUtils;

var baseURL         = "http://localhost:3000";

describe("Demo 6 - Schema validation", function(){

    // Async environment to link all tests
    var env = new JasmineAsyncEnv();

    // Here we setup a basic test and run a schema check on the result
    it("Run schema check on users", env.wrap(function(env){
        RequestRunner.run(new CallConfig({
            baseURL                 : baseURL,
            endPoint                : "/users/1",
            method                  : "GET",
            // Here we set the checkResponseSchemaFunc and the checkResponseSchema to true
            // You need to set both as the function is only executed if checkResponseSchema is set to true
            // There are properties for response and request schema checks
            checkResponseSchema     : true,
            checkResponseSchemaFunc : function(env, call, data, res) {

                // Define the schema for the response
                // This can come directly from a swagger JSON file
                // For this example its defined it inline for simplicity
                var userSchema = {
                    type: "object",
                    required: [
                        "id",
                        "username",
                        "name",
                        // This property it not actually included in the reponse
                        // Uncomment to see an example of what a schema error will look like in the report
                        //"surname"
                    ],
                    properties: {
                        id      : { type: "number" },
                        username: { type: "string" },
                        name    : { type: "string" },
                        surname : { type: "number" }
                    }
                };

                // Use the validateSchema() utility method to validate the schema
                // Behind the scenes this simply uses the tiny validator lib to run a schema check
                // https://github.com/geraintluff/tv4
                // It also adds some pretty printing into the report's output to help debugging
                // If you want something more complex you can implment the tiny validator API using some custom code
                TestUtils.validateSchema(data, userSchema, true);
            }
        }), env);
    }));
});