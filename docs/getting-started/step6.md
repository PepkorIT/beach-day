# JSON Schema validation (Swagger or equivalent)

Tools like [Swagger](http://swagger.io/) are based on JSON Schemas. Beach-day takes advantage of this and makes it easy to validate both requests and responses. 

> Under the hood beach-day uses the [tiny validator](https://github.com/geraintluff/tv4) library to run schema validations

Create a new file `tests/demo6-test.js` and paste the following:
```javascript
var BeachDay        = require("beach-day");
var JasmineAsyncEnv = BeachDay.JasmineAsyncEnv;
var RequestRunner   = BeachDay.RequestRunner;
var CallConfig      = BeachDay.CallConfig;

// beach-day TestUtils has utility method for running schema validations
var TestUtils       = BeachDay.TestUtils;

// For illustration purposes we define a JSON Schema inline. Ideally you'd want to pull this out of your Swagger file
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

describe("Demo 6 - Schema validation", function(){

    var env = new JasmineAsyncEnv();

    it("Run schema check on users", env.wrap(function(env){
        RequestRunner.run(new CallConfig({
            baseURL                 : "http://jsonplaceholder.typicode.com",
            endPoint                : "/users/1",
            method                  : "GET",
            checkResponseSchema     : true, // Must be set in order for checkResponseSchemaFunc() to run 
            checkResponseSchemaFunc : function(env, call, data, res) {
                TestUtils.validateSchema(data, userSchema, true);
            }
        }), env);
    }));
});
```


### [>> Next: Keeping test code DRY](step5.md)

[<< Previous: Assertions & sharing data between calls](step7.md)