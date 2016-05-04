import { JasmineAsyncEnv, console, ReporterAPI, TestUtils} from "../../lib/index";
import * as request from "request";

// Report is excluded by default as this suite is designed to check the output of the reporter
// Enable it to test the reporter output
describe("Report testing wrapper", function(){

    describe("Category 1", function(){

        var env = new JasmineAsyncEnv();

        it("Run async test (expect pass)", env.wrap(function(env){
            expect("jon").toBe("jon");
            var logObj      = {name:"jon", circle:null};
            logObj.circle   = logObj;
            console.log("Something going to be logged out", logObj);
            setTimeout(env.done, 10);
        }));

        it("Run an assertion that will show (expect fail)", env.wrap(function(env) {
            expect("this").toBe("that");
            expect("someone").toBe("there");
            expect("anyone").toBe("there");
            console.log("Some data from the test here...");
            env.done();
        }));

        it("Test something that is gonna expect fail (expect not run)", env.wrap(function(env){
            expect(false).toBe(true);
            env.done();
        }));

        describe("Child block", function(){

            it("Run test 1 (expect not run)", env.wrap(function(env){
                expect("jon").toBe("jon");
                expect("Beech").toBe("beech");
                env.done();
            }));

            xit("Skipped test (expect skipped)", env.wrap(function(env){
                expect("jon").toBe("Jon");
                env.done();
            }));

            describe("Further inner suite", function(){
                it("Test something (expect not run)", env.wrap(function(env){
                    env.done();
                }))
            })

        });
    });

    describe("Category 2", function(){

        var env2 = new JasmineAsyncEnv();

        it("Run async test (expect pass)", env2.wrap(function(env){
            expect("jon").toBe("jon");
            var logObj      = {name:"jon", circle:null};
            logObj.circle   = logObj;
            console.log("Something going to be logged out", logObj);
            setTimeout(env.done, 10);
        }));

        it("Test something that is gonna throw an error (expect impl error)", env2.wrap(function(env) {
            this["expected"](false).toBe(true);
            env.done();
        }));
    });


    describe("Environment checks", function(){

        var env = new JasmineAsyncEnv();

        var envOne = new JasmineAsyncEnv();
        envOne["something"] = "else";
        var envTwo = new JasmineAsyncEnv(envOne);

        it("Test linked environment (expect pass)", envTwo.wrap(function(envTwo){
            expect(envTwo["something"]).toBe("else");
            envTwo.done();
        }));

        it("Env test failure (expect fail)", env.wrap(function(){
            expect(true).toBe(false);
            env.done();
        }));

        it("Expect this to not run (expect not run)", env.wrap(function(){
            expect("jon").toBe("jon");
            env.done();
        }))

    });

    describe("Utilities used in the framework", function(){

        var schema = {
            type: "object",
            required: ["name", "age", "surname"],
            properties: {
                name: { type:"string" },
                age: { type:"number" },
                surname: { type:"string" }
            }
        };

        it("Expect missing schema (expect impl error)", function(){
            TestUtils.validateSwaggerSchema({}, {}, "/fetch/user", "Get", false);
        });

        it("Expect missing schema for response (expect impl error)", function(){
            TestUtils.validateSwaggerSchema({}, {}, "/fetch/user", "Get", true, 200);
        });

        it("Expect an invalid schema (expect fail)", function(){
            var swagger = {
                paths: {
                    "/fetch/user": {
                        "get": {
                            responses: {
                                "200":{
                                    schema: schema
                                }
                            }
                        }
                    }
                }
            };
            TestUtils.validateSwaggerSchema({name:100, age:"jon"}, swagger, "/fetch/user", "Get", true, 200);
        });

        it("Expect an invalid request schema (expect impl error)", function(){
            var swagger = {
                paths: {
                    "/fetch/user": {
                        "get": {
                            parameters: [
                                {
                                    "in": "body",
                                    schema: schema
                                }
                            ]
                        }
                    }
                }
            };
            TestUtils.validateSwaggerSchema({name:100, age:"jon"}, swagger, "/fetch/user", "Get", true);
        });

        it("Expect invalid status code (expect fail)", function(){
            expect("200").statusCodeToBe(500);
        });

    });

    describe("Report check", function(){
        var env = new JasmineAsyncEnv();

        it("Test longer test time (expect pass)", env.wrap(function(env){
            ReporterAPI.overrideSpecMaxTestTime(3000);

            setTimeout(env.done, 3010);

        }), 6000);
    })
});