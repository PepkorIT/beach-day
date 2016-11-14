# Keeping test code DRY 

## DRY Test Config

Keeping test code [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) is something beach-day focused on from the begining. 

By using the `CallConfig` object's `extend()` method you can achieve some very DRY config. The easiest way to see the power of this is by means of a code example:

```javascript
var CallConfig  = require("beach-day").CallConfig;

// Create a base CallConfig object
var config1 = new CallConfig({
    strProp : "www.google.com",
    itemArr : ["a"],
    props   : {e:"123"}
});

// Extend config1 with a new set of properties
// Note config1 will not be modified, instead the
// extend() method will return a new instance
var config2  = config1.extend({
    strProp : "www.yahoo.com",
    itemArr : ["b"],
    props   : {d:"456"}
});

console.log(config2.strProp);       // "www.yahoo.com";
console.log(config2.itemArr[0]);    // "a";
console.log(config2.itemArr[1]);    // "b";
console.log(config2.props.e);       // "123";
console.log(config2.props.d);       // "456";

console.log(config1.strProp);       // "www.google.com";
console.log(config1.itemArr[0]);    // "a";
console.log(config1.props.e);       // "123";
```

**Important to note**
- `config1` was not modified
- Primitive datatypes are overridden
- Objects and arrays are extended

This gives us the power to build up config objects in a hierarchy that we so choose.

## Global Defaults

The `RequestRunner`'s `globalDefaults` property allows you to setup config that will applied to all calls is your test suite.  

Create a new file `tests/demo7-test.js` and paste the following:
```javascript
var BeachDay        = require("beach-day");
var JasmineAsyncEnv = BeachDay.JasmineAsyncEnv;
var RequestRunner   = BeachDay.RequestRunner;
var CallConfig      = BeachDay.CallConfig;

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
```

Let's examine what happened in the code above:

 - We setup a globalDefaults CallConfig that will be used as the base for all tests
 - We added a global assert fuction that makes sure our status code is tested
 - Our tests now require less config to get started

## Where to now?
First up, thanks for getting this far in our tutorial! We hope you enjoy this framework and get some good use out of it.
Please checkout the FAQ section, we'll keep adding as to it as we go.


[<< Previous: JSON Schema validation (Swagger or equivalent)](step7.md)