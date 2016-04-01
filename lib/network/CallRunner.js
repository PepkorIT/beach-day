"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require("lodash");
var request = require("request");
var ExtendingObject_1 = require("./ExtendingObject");
var Matchers_1 = require("../utils/Matchers");
var urlJoin = require("url-join");
var CallConfig = (function (_super) {
    __extends(CallConfig, _super);
    function CallConfig() {
        _super.apply(this, arguments);
        this.method = "post";
        this.status = 200;
    }
    // Get data proxy
    CallConfig.prototype.getDataImpl = function (env) {
        if (this.dataArr == null) {
            return null;
        }
        else {
            var result;
            for (var i = 0; i < this.dataArr.length; i++) {
                var arrItem = this.dataArr[i];
                var dataResult;
                if (typeof arrItem == "function") {
                    dataResult = arrItem(env);
                }
                else if (typeof arrItem == "object" || arrItem == null) {
                    dataResult = arrItem;
                }
                else {
                    throw new Error("Unsupported data object type, we only support: null, object or function: " + arrItem + JSON.stringify(this, null, 4));
                }
                if (!result) {
                    result = dataResult;
                }
                else {
                    _.extend(result, dataResult);
                }
            }
            return result;
        }
    };
    // Proxy for running all assertions
    CallConfig.prototype.assertFuncImpl = function (env, res, body) {
        if (this.assertFuncArr) {
            for (var i = 0; i < this.assertFuncArr.length; i++) {
                var func = this.assertFuncArr[i];
                func(env, res, body);
            }
        }
    };
    // Proxy for all obfuscations
    CallConfig.prototype.obfuscateFuncImpl = function (env, res, body) {
        if (this.obfuscateArr) {
            for (var i = 0; i < this.obfuscateArr.length; i++) {
                var func = this.obfuscateArr[i];
                func(this, env, res, body);
            }
        }
    };
    // Easy schema check proxy
    CallConfig.prototype.checkSchemaImpl = function (data, isRequest) {
        if (isRequest && this.checkRequestSchema && this.checkSchemaFunc != null) {
            return this.checkSchemaFunc(this, data, isRequest);
        }
        else if (!isRequest && this.checkSchema && this.checkSchemaFunc != null) {
            return this.checkSchemaFunc(this, data, isRequest);
        }
        else {
            return true;
        }
    };
    Object.defineProperty(CallConfig.prototype, "fullURL", {
        get: function () {
            return this.baseURL && this.endPoint ? urlJoin(this.baseURL, this.endPoint) : null;
        },
        enumerable: true,
        configurable: true
    });
    CallConfig.prototype.extend = function (params) {
        return _super.prototype.extend.call(this, new CallConfig(), params);
    };
    return CallConfig;
}(ExtendingObject_1.ExtendingObject));
exports.CallConfig = CallConfig;
var CallRunner = (function () {
    function CallRunner() {
        this.timeout = 15 * 1000;
    }
    CallRunner.prototype.run = function (call, env) {
        var _this = this;
        if (call.endPoint == null)
            throw new Error("endPoint is a required field for your CallConfig");
        if (call.baseURL == null)
            throw new Error("baseURL is a required field for your CallConfig");
        // Default header to use json
        var headers = {
            "Content-type:": "application/json"
        };
        if (call.headers)
            call.headers.forEach(function (keyVal) { return headers[keyVal.key] = keyVal.value; });
        var requestPased = true;
        var sendBody;
        if (call.method != "GET") {
            var data = call.getDataImpl(env);
            if (data) {
                requestPased = call.checkSchemaImpl(data, true);
                sendBody = JSON.stringify(data);
            }
        }
        if (!requestPased) {
            // Just complete the request if there are any errors
            env.done();
        }
        else {
            var options = {
                uri: call.fullURL,
                method: call.method.toUpperCase(),
                headers: headers,
                json: false,
                body: sendBody,
                timeout: this.timeout
            };
            request(options, function (error, response, body) {
                if (error) {
                }
                else {
                    // Assert the status
                    expect(response.statusCode).statusCodeToBe(call.status);
                    // Try convert the json response
                    if (body) {
                        try {
                            body = JSON.parse(body);
                        }
                        catch (e) {
                            Matchers_1.throwExpectError("Expected JSON parsing from the server to pass");
                            console.log("JSON Parsing Error: ");
                            console.log(e.message);
                            console.log("Original data from server:");
                            console.log(body);
                        }
                    }
                    // Set the body on the environment
                    env.currentBody = body;
                    // Run obfuscation
                    call.obfuscateFuncImpl(env, response, body);
                    // Log out the request and response
                    _this.logRequestResponse(error, response, body);
                    // Check schemas if setup
                    call.checkSchemaImpl(body, false);
                    // Run assertions
                    call.assertFuncImpl(env, response, body);
                    //expect(body).toNotHaveAnyStringNulls();
                    // Lastly call done()
                    env.done();
                }
            });
        }
    };
    CallRunner.prototype.logRequestResponse = function (error, res, body) {
        if (res) {
            /*if (res.request) {
                //console.log("URL: ", res.request.href);
                //console.log("Request Headers:\n", JSON.stringify(res.request.headers, null, 4));
            }
            if (res.headers) {
                //console.log("Response Headers:\n", JSON.stringify(res.headers, null, 4));
            }
            if (body) {
                //console.log("Response Body:\n", JSON.stringify(body, null, 4));
            }*/
            //console.log("Elapsed Time: ", res.elapsedTime);
            //var requestBody = JSON.parse("\"" + res.request.body + "\"")
            //console.log(requestBody)
            /*arr.push(
                "<strong>REQUEST</strong>",
                "<hr class='short' />",
                "URL: " + res.request.uri.href,
                "Method: " + res.request.method,
                "Request Headers:\n" + pretty(res.request.headers),
                "Body:\n" + res.request.body,
                "",
                "<strong>RESPONSE</strong>",
                "<hr class='short' />",
                "Status Code: " + res.statusCode,
                "Response Headers:\n" + pretty(res.headers),
                "Body:\n" + pretty(body),
                "<hr />"
            );*/
            console.log("REQUEST: " + JSON.stringify(res, null, 4));
        }
        else {
            console.log("HTTP Error => " + JSON.stringify(error, null, 4));
        }
    };
    return CallRunner;
}());
exports.CallRunner = CallRunner;
