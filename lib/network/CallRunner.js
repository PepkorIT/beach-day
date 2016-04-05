"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require("lodash");
var request = require("request");
var ExtendingObject_1 = require("./ExtendingObject");
var BeachDayReporter_1 = require("../reporter/BeachDayReporter");
var TestUtils_1 = require("../utils/TestUtils");
var urlJoin = require("url-join");
var CallConfig = (function (_super) {
    __extends(CallConfig, _super);
    function CallConfig(params) {
        // Set defaults if not already done
        _super.call(this, { method: "POST", status: 200 }, params);
    }
    // Before proxy
    CallConfig.prototype.beforeProxy = function (env) {
        if (this.beforeFuncArr) {
            for (var i = 0; i < this.beforeFuncArr.length; i++) {
                this.beforeFuncArr[i](env, this);
            }
        }
    };
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
                func(env, this, body);
            }
        }
    };
    // Proxy for all obfuscations
    CallConfig.prototype.obfuscateFuncImpl = function (env, res, body) {
        if (this.obfuscateArr) {
            for (var i = 0; i < this.obfuscateArr.length; i++) {
                var func = this.obfuscateArr[i];
                func(env, this, body);
            }
        }
    };
    // Easy schema check proxy
    CallConfig.prototype.checkSchemaImpl = function (env, data, isRequest) {
        if (isRequest && this.checkRequestSchema && this.checkRequestSchemaFunc != null) {
            return this.checkRequestSchemaFunc(env, this, data);
        }
        else if (!isRequest && this.checkResponseSchema && this.checkResponseSchemaFunc != null) {
            return this.checkResponseSchemaFunc(env, this, data);
        }
        else {
            return true;
        }
    };
    Object.defineProperty(CallConfig.prototype, "fullURL", {
        get: function () {
            return this.baseURL != null && this.endPoint != null ? urlJoin(this.baseURL, this.endPoint) : null;
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
        // Run the before calls for any last trasformations
        call.beforeProxy(env);
        // Default header to use json
        var headers = {
            "Content-Type": "application/json"
        };
        if (call.headers) {
            for (var propName in call.headers) {
                if (!headers.hasOwnProperty(propName.toLowerCase())) {
                    headers[propName] = call.headers[propName];
                }
            }
        }
        var requestPassed = true;
        var sendBody;
        if (call.method != "GET") {
            var data = call.getDataImpl(env);
            if (data) {
                requestPassed = call.checkSchemaImpl(env, data, true);
                sendBody = JSON.stringify(data);
            }
        }
        if (!requestPassed) {
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
                    // Log out the request and response
                    _this.logRequestResponse(error, response, body, options);
                    TestUtils_1.TestUtils.throwExpectError("Expected HTTP call to be successful");
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
                            TestUtils_1.TestUtils.throwExpectError("Expected JSON parsing from the server to pass");
                            BeachDayReporter_1.console.log("JSON Parsing Error: ");
                            BeachDayReporter_1.console.log(e.message);
                            BeachDayReporter_1.console.log("Original data from server:");
                            BeachDayReporter_1.console.log(body);
                        }
                    }
                    // Set the body on the environment
                    env.currentBody = body;
                    // Run obfuscation
                    call.obfuscateFuncImpl(env, response, body);
                    // Log out the request and response
                    _this.logRequestResponse(error, response, body, options);
                    // Check schemas if setup
                    call.checkSchemaImpl(env, body, false);
                    // Run assertions
                    call.assertFuncImpl(env, response, body);
                }
                // Lastly call done()
                env.done();
            });
        }
    };
    CallRunner.prototype.logRequestResponse = function (error, res, body, options) {
        if (res) {
            BeachDayReporter_1.console.log("<strong>REQUEST</strong>");
            BeachDayReporter_1.console.log("<hr class='short' />");
            BeachDayReporter_1.console.log("URL: " + res.request.uri.href);
            BeachDayReporter_1.console.log("Method: " + res.request.method);
            BeachDayReporter_1.console.log("Request Headers:\n" + JSON.stringify(res.request.headers, null, 4));
            BeachDayReporter_1.console.log("Body:\n" + res.request.body);
            BeachDayReporter_1.console.log("");
            BeachDayReporter_1.console.log("<strong>RESPONSE</strong>");
            BeachDayReporter_1.console.log("<hr class='short' />");
            BeachDayReporter_1.console.log("Status Code: " + res.statusCode);
            BeachDayReporter_1.console.log("Response Headers:\n" + JSON.stringify(res.headers, null, 4));
            BeachDayReporter_1.console.log("Body:\n" + JSON.stringify(body, null, 4));
            BeachDayReporter_1.console.log("");
        }
        else {
            BeachDayReporter_1.console.log("<strong>Request library error:</strong>");
            BeachDayReporter_1.console.log(JSON.stringify(error, null, 4));
            BeachDayReporter_1.console.log("<strong>REQUEST</strong>");
            BeachDayReporter_1.console.log("<hr class='short' />");
            BeachDayReporter_1.console.log("URL: " + options.uri);
            BeachDayReporter_1.console.log("Method: " + options.method);
            BeachDayReporter_1.console.log("Request Headers:\n" + JSON.stringify(options.headers, null, 4));
            if (options.body) {
                var body = options.body;
                for (var propName in options.headers) {
                    if (propName.toLowerCase() == "content-type" && options.headers[propName].toLowerCase().indexOf("application/json") != -1) {
                        body = JSON.stringify(JSON.parse(body), null, 4);
                        break;
                    }
                }
                BeachDayReporter_1.console.log("Body:\n" + body);
            }
            BeachDayReporter_1.console.log("Timeout: " + options.timeout);
            BeachDayReporter_1.console.log("");
        }
    };
    return CallRunner;
}());
exports.CallRunner = CallRunner;
