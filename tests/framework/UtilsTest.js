"use strict";
var index_1 = require("../../lib/index");
describe("Utilities used in the framework", function () {
    var schema = {
        type: "object",
        required: ["name", "age", "surname"],
        properties: {
            name: { type: "string" },
            age: { type: "number" },
            surname: { type: "string" }
        }
    };
    it("Expect missing schema - expect fail", function () {
        index_1.validateSwaggerSchema({}, {}, "/fetch/user", "Get");
    });
    it("Expect missing schema for response - expect fail", function () {
        index_1.validateSwaggerSchema({}, {}, "/fetch/user", "Get", 200);
    });
    it("Expect an invalid schema - expect fail", function () {
        var swagger = {
            paths: {
                "/fetch/user": {
                    "get": {
                        responses: {
                            "200": {
                                schema: schema
                            }
                        }
                    }
                }
            }
        };
        index_1.validateSwaggerSchema({ name: 100, age: "jon" }, swagger, "/fetch/user", "Get", 200);
    });
    it("Expect an invalid request schema - expect fail", function () {
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
        index_1.validateSwaggerSchema({ name: 100, age: "jon" }, swagger, "/fetch/user", "Get");
    });
    it("Expect invalid status code - expect fail", function () {
        expect("200").statusCodeToBe(500);
    });
});
