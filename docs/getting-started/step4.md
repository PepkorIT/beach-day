# HTTP Calls - Running a POST

Data for an HTTP POST is setup using the `CallConfig dataArr` property. This array can hold any amount of objects or functions to return objects.

When a HTTP call is made this array is iterated and objects are extended one over the next to build up a final object to send with the call. By default the framework will use `JSON.stringify()` for serialise the data before making the call, if you want to override this you can set the `CallConfig dataSerialisationFunc` property.

Create a new file `tests/demo4-test.js` and paste the following:
```javascript
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
```

Let's examine what happened in the code above: 

 - We made a HTTP call using a `CallConfig`, this time using the `"POST"` method
 - For illustration purposes, we passed data to our POST in two different ways. Beach-day will loop through each element in the dataArr and build up a final object. This object will be sent as a JSON string. The result of the object sent to the server in our example above will look like:
```json
 {
   "userId": 3,
   "title": "New Post",
   "body": "This post was created using: http://jsonplaceholder.typicode.com/posts"
 }
```

### [>> Next: Assertions & sharing data between calls](step5.md)

[<< Previous: HTTP Calls - Running a GET](step3.md)