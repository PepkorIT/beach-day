# Config extension & defaults (Step 7)

Something you may have noticed in all of the tests we have written in this tutorial is that some of your config may get quite verbose when written in a real world scenario.

This was one of the primary considerations for the beach-day framework as there is no need for an implementing project to be rewriting unnecessary config. As [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) as possible right :)

There is a built in method for the `CallConfig` called `extend()`. This extend method will take the current config, generate a new one based on it and extend that using all the properties for the object passed in. 
It goes further than simply overwriting properties, if an object is encountered it will extend the original object with the new one. If an array is encountered it will add all the new entries to the original.

This gives us the power to build up config objects in a hierarchy that we so choose. Just to clarify the functionality of the config object here is an abstract code sample to help explain.

```javascript
var CallConfig  = require("beach-day").CallConfig;

// This will create a base call config object we can extend
var config1     = new CallConfig({
    strProp : "www.google.com",
    itemArr : ["a"],
    props   : {e:"123"};
});

// Now lets extend config1 with a new set of properties
// Note config1 will not be modified but instead the
// extend method will return a new instance
var config2     = config1.extend({
    strProp : "www.yahoo.com",
    itemArr : ["b"],
    props   : {d:"456"};
});

// Here we illustrate what the values of config2 will be
config2.strProp == "www.yahoo.com";
config2.itemArr[0] == "a";
config2.itemArr[1] == "b";
config2.props.e == "123";
config2.props.d == "456";

// We can further extend config2 if we so please
```


So now that we understand how the config extension works there is one last feature to mention. The `RequestRunner` class has a property `globalDefaults`. This is simply an instance of a CallConfig, every config that is sent to the `RequestRunner.run()` method will be based on the globalDefaults.
This property can be used to setup some defaults that will be applied across the testing framework. This can be handy for extending the config object functionality or just setting properties that do not need to change.

Lets create a new test file example of this at `tests/demo7-test.js`:
```javascript
var JasmineAsyncEnv = require("beach-day").JasmineAsyncEnv;
var RequestRunner   = require("beach-day").RequestRunner;
var CallConfig      = require("beach-day").CallConfig;

var baseURL         = "http://localhost:3000";



// Here we setup the globalDefaults for the entire project
// These defaults will be used as a base for all CallConfig objects passed to RequestRunner.run()
// This is written outside of the test to illustrate it can easily come from an external
// file and be require()'d into each test file.
// We simply set some basic defaults we know will be the same for every call
RequestRunner.globalDefaults = new CallConfig({
    checkResponseSchema : true,
    checkRequestSchema  : true,
    method              : "GET",

    // Here we add a default assert function that will be applied to every config object
    // It looks for a statusCode property and if present ensures the call respondes with that status code
    assertFuncArr       : [function(env, call, body, res){
        if (call.hasOwnProperty("statusCode")){
            expect(res.statusCode).toBe(call.statusCode);
        }
    }]
});




describe("Demo 7 - Config defaults and extension", function(){

    // Here we create a default config we can base our tests off
    // This config will need to be manually extended to be used
    // unlike the above globalDefaults which are automatically extended when calling RequestRunner.run()
    var defaultConfig = new CallConfig({
        // We set the baseURL as all the calls in this suite will run off the same service
        baseURL     : baseURL,

        // We set a default status code to be checked by the RequestRunner.globalDefaults assertFunc
        // This can easily be overridden if needed
        // You can change this to something else to see this test fail in the report
        statusCode  : 200
    });

    var env = new JasmineAsyncEnv();

    // Now that we are utilising the config extension the test body verbosity drops substantially
    // If you wanted you could reduce this even more by creating a utility to generate tests
    it("Run get users", env.wrap(function(env){
        RequestRunner.run(defaultConfig.extend({
            endPoint : "/users/1",
        }), env);
    }));
});
```

So lets examine what has happened in the above test.

 - We setup a globalDefaults call config that will be the base for all config objects when run
 - The globalDefaults apply some default properties
 - The globalDefaults additionally add some custom assertion functionality to the test suite that checks a status code of the HTTP response.
 - Then in the test suite we define a default config to extend from for our tests, these properties are local to the test suite but could easily be shared in a separate nodejs module
 - Lastly we execute a simple test, but by now the config for the implementation only consists of 1 property reducing code needed to implement actual tests.

## Where to now?
First up, thanks for getting this far in our tutorial! We hope you enjoy this framework and get some good use out of it.
Please checkout the FAQ section, there are a bunch of features and how to's dropped in there which may answer any outstanding questions you have.
You can also checkout the code documentation on all the methods and properties to give you an in depth review of what is possible.

If you found this documentation was lacking something, please help us improve it by contributing to it! All contributions are welcome!


### [Previous Step](step6.md)