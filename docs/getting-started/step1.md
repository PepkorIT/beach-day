# Getting Started (Step 1)

> **Before we begin:** 
> 
> It is important that you have a grasp of the jasmine framework and core concepts.
> The beach-day module builds on top of the jasmine test runner and this documentation won't cover jasmine in great detail. 
> Please refer to the [jasmine documentation](http://jasmine.github.io/edge/introduction.html) for this.
> 
> **Source Files:**
> All of the code samples in this tutorial can be found in the [src](src) folder of this directory. 

## Project Setup
Before we can begin to use beach-day, we will need to setup a few things.
You will need to have [nodejs](https://nodejs.org/en/) and [GIT](https://git-scm.com/) installed and working.

Next you need to setup your project. beach-day is a module that is installed as an [npm](https://www.npmjs.com/) dependency so lets create a new project that we can work from.

First create your new project directory then fire up the command line and `cd` into your project folder.  
From now all commands will assume your command line is placed inside your project.  
Then initalise your project with a [package.json file](https://docs.npmjs.com/getting-started/using-a-package.json) using this command:  
```
npm init
```

This process should ask you a number of questions about your project. As your project will not available as a public npm module, you can safely leave all of these as the suggested defaults.  
If successful this should have created a [package.json file](https://docs.npmjs.com/getting-started/using-a-package.json) in your project root.
  
  
Next install this npm module (beach-day) locally as a dependency using command:  

```
npm install beach-day --save
```
This will download this module and save it as a dependency in the package.json. If you want to commit your project to GIT please remember to ignore the node_modules folder generated by npm, anyone who uses your project can run `npm install` in the root of the project to get all the dependencies again.

## Environment Setup


Now that we have a project setup to use beach day lets setup our project to run some node based [jasmine](http://jasmine.github.io/edge/introduction.html) tests.
The [jasmine](http://jasmine.github.io/edge/node.html) documentation has a whole section on using tests in node, so if you get stuck please read through it.

When installing beach-day npm should have installed jasmine as a peer dependency to it. All we need to do now is setup a custom jasmine boot file. 
A boot file basically creates an instance of jasmine and allows us to configure it manually.
When our boot file is complete, you will run all your tests using:
```
node boot.js
```

Create a file boot.js and place it in your project root. The contents should be as follows:
``` javascript
// Import the required dependencies for the booting of jasmine
var BeachDayReporter    = require("beach-day").BeachDayReporter;
var Jasmine             = require("jasmine");
var SpecReporter        = require("jasmine-spec-reporter");

// Create a new instance of the jasmine framework
var jasmineInst         = new Jasmine();

// Setup sensible timeout amount for the jasmine tests
// We don't jasmine tests to timeout before an http call has been completed
global["jasmine"].DEFAULT_TIMEOUT_INTERVAL = 10000;

// Disable default jasmine reporter
jasmineInst.configureDefaultReporter({ print: function () { } });

// Add the spec reporter for console reporting
// https://github.com/bcaudan/jasmine-spec-reporter
jasmineInst.addReporter(new SpecReporter({
    displayStacktrace: "all"
}));

// Add an instance of the beach-day custom HTML reporter
// All the default config is used
jasmineInst.addReporter(new BeachDayReporter());

// Load up a jasmine config for the test environment
jasmineInst.loadConfigFile("jasmine_config.json");

// Run the jasmine instance to start all tests
jasmineInst.execute();
```


Next up we need to create a jasmine config file to tell jasmine where our tests are located. Create a new file called jasmine_config.json in the project root with:

``` json
{
    "spec_dir": "tests",
    "spec_files": [
        "**/*[tT]est.js"
    ],
    "helpers": [
        "helpers/**/*.js"
    ],
    "stopSpecOnExpectationFailure": false,
    "random": false
}
```

Finally lets add a basic test to ensure our environment is all setup and working. Create a new file under `tests/demo1-test.js` with the content:
```javascript
describe("Demo 1 - Using the reporter", function(){

    // Simple test data
    var world = {status:"all well"};

    // Basic test 1, should pass
    it("Ensure the world exists", function(){
        expect(world).toBeDefined();
    });
});
```

Now if you run your tests using `node boot.js` you should see your tests execute in the command line and there should be an output in the folder `reports/beach-day-report.html`. You can open this file using an HTTP server and should see your HTML report.
If there is no report please ensure you don't have an errors in the command line or reread this step to make sure everything is correct.

### [Next Step](step2.md)