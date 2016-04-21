# Schema validation (Step 6)

One of the common tasks required when testing an HTTP service is to ensure that the responses have a specific format. Often times format requirements for an API can be missed by the naked eye so its good to do a code based check on the format.

Luckily for us there is already a system designed for this when it comes to JSON. Its called JSON schema validation. beach-day has some utilities to help writing schema validators and executing them. 

Under the hood beach-day uses the [tiny validator](https://github.com/geraintluff/tv4) library to run all schema validations.

We recommended that you use tiny validator and a swagger schema to validate your JSON responses and requests but you are not tied to those choices, you can implement which ever schema validation mechanism you like.

The beach-day CallConfig object provides properties to run response **and** request schema checks. It is just as important to make sure the data you are sending to the server is correct.

Lets create a new test file example of this at `tests/demo6-test.js`:
```javascript
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
                // If you want something more complex you can implement the tiny validator API using some custom code
                TestUtils.validateSchema(data, userSchema, true);
            }
        }), env);
    }));
});
```

So lets examine what has happened in the above test.

 - We ran a simple HTTP GET
 - We populated the checkResponseSchemaFunc and set the checkResponseSchema to true
 - When the call was completed the checkResponseSchemaFunc() was fired and we validated the schema
 - The schema was written inline for simplicity
 - We utilised the TestUtils.validateSchema to get some pretty printing in the report for errors

### [Previous Step](step5.md) | [Next Step](step7.md)