import {validateSwaggerSchema} from "../../lib/index";

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

    it("Expect missing schema", function(){
        validateSwaggerSchema({}, {}, "/fetch/user", "Get");
    });

    it("Expect missing schema for response", function(){
        validateSwaggerSchema({}, {}, "/fetch/user", "Get", 200);
    });

    it("Expect an invalid schema", function(){
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
        validateSwaggerSchema({name:100, age:"jon"}, swagger, "/fetch/user", "Get", 200);
    });

    it("Expect an invalid request schema", function(){
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
        validateSwaggerSchema({name:100, age:"jon"}, swagger, "/fetch/user", "Get");
    });

});