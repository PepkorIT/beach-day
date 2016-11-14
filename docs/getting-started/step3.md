# HTTP Calls - Running a GET

Finally we run a real API call! This is where beach-day really shines as it manages, records and reports on all HTTP/HTTPS traffic.  

> Under the hood, beach-day uses the [request](https://github.com/request/request) framework

Beach-day provides a set of config & utilities to help write tests with very little code and make assertions on the data returned a breeze. You do this using two of the beach-day clases:
- `CallConfig`
- `RequestRunner`

`CallConfig` is an object that defines your HTTP call as well as your assertions for the response

`RequestRunner` runs your defined `CallConfig`

Create a new file `tests/demo3-test.js` and paste the following:

```javascript
var BeachDay        = require("beach-day");
var JasmineAsyncEnv = BeachDay.JasmineAsyncEnv;
var RequestRunner   = BeachDay.RequestRunner;
var CallConfig      = BeachDay.CallConfig;

describe("Demo 3 - Running an HTTP call", function(){

    var env = new JasmineAsyncEnv();
    
    it("Ensure we get a simple result", env.wrap(function(env){
        RequestRunner.run(new CallConfig({
            baseURL     : "http://jsonplaceholder.typicode.com",
            endPoint    : "/posts/1",
            method      : "GET"
        }), env); // The RequestRunner will run env.done() for us automatically
    }));
});
```

Let's examine what happened in the code above:

 - We defined a new `CallConfig` to make a `http://jsonplaceholder.typicode.com/posts/1` call
 - We executed the call using the `RequestRunner.run()`
 - By passing our `JasmineAsyncEnv` instance to the `RequestRunner`, it will run `env.done()` for us when it's complete


To run this and inspect the report (`reports/beach-day-report.html`):

```
node boot.js
```


> **Convention:**
> As a convention it is recommended to stick to 1 HTTP call per Jasmine test but there may be exceptions to this. For instance if you wanted to a poll till a certain value has changed.
> It is up to you to make this call but as a rule of thumb, 1 HTTP call per test. 

### [>> Next: HTTP Calls - Running a POST](step4.md)

[<< Previous: Beach-day Fundamentals](step2.md)