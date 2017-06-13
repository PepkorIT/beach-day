"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var ExtendingObject_1 = require("./ExtendingObject");
var urlJoin = require("url-join");
var CallConfig = (function (_super) {
    __extends(CallConfig, _super);
    function CallConfig(params) {
        var _this = _super.call(this) || this;
        // Set defaults if not already done
        if (params)
            _.assignWith(_this, params, _this.extender);
        return _this;
    }
    /**
     * Proxy for executing the beforeFuncArr calls
     */
    CallConfig.prototype.beforeProxy = function (env) {
        if (this.beforeFuncArr) {
            for (var i = 0; i < this.beforeFuncArr.length; i++) {
                this.beforeFuncArr[i](env, this);
            }
        }
    };
    /**
     * Proxy for executing the dataArr calls
     */
    CallConfig.prototype.getDataImpl = function (env) {
        if (this.dataArr == null || this.dataArr.length == 0) {
            return null;
        }
        else {
            var result = {};
            for (var i = 0; i < this.dataArr.length; i++) {
                var arrItem = this.dataArr[i];
                var dataResult;
                if (typeof arrItem == "function") {
                    dataResult = arrItem(env, this);
                }
                else if (typeof arrItem == "object" || arrItem == null) {
                    dataResult = arrItem;
                }
                else {
                    throw new Error("Unsupported data object type, we only support: null, object or function: " + arrItem + JSON.stringify(this, null, 4));
                }
                _.extend(result, dataResult);
            }
            return result;
        }
    };
    /**
     * Proxy for executing the headersArr calls
     */
    CallConfig.prototype.getHeadersImpl = function (env) {
        var result = _.extend({}, this.headers);
        if (this.headersArr != null) {
            for (var i = 0; i < this.headersArr.length; i++) {
                var arrItem = this.headersArr[i];
                var dataResult;
                if (typeof arrItem == "function") {
                    dataResult = arrItem(env, this);
                }
                else if (typeof arrItem == "object" || arrItem == null) {
                    dataResult = arrItem;
                }
                else {
                    throw new Error("Unsupported data object type, we only support: null, object or function: " + arrItem + JSON.stringify(this, null, 4));
                }
                _.extend(result, dataResult);
            }
        }
        return result;
    };
    /**
     * Proxy for running all assertions
     */
    CallConfig.prototype.assertFuncImpl = function (env, body, res) {
        if (this.assertFuncArr) {
            for (var i = 0; i < this.assertFuncArr.length; i++) {
                var func = this.assertFuncArr[i];
                func(env, this, body, res);
            }
        }
    };
    /**
     * Proxy for all obfuscations
     */
    CallConfig.prototype.obfuscateFuncImpl = function (env, body, res) {
        if (this.obfuscateArr) {
            for (var i = 0; i < this.obfuscateArr.length; i++) {
                var func = this.obfuscateArr[i];
                func(env, this, body, res);
            }
        }
    };
    /**
     * Proxy for running schema checks
     */
    CallConfig.prototype.checkSchemaImpl = function (env, data, isRequest, res) {
        if (isRequest && this.checkRequestSchema && this.checkRequestSchemaFunc != null) {
            return this.checkRequestSchemaFunc(env, this, data, null);
        }
        else if (!isRequest && this.checkResponseSchema && this.checkResponseSchemaFunc != null) {
            return this.checkResponseSchemaFunc(env, this, data, res);
        }
        else {
            return true;
        }
    };
    /**
     * Returns the full api url for running the call
     */
    CallConfig.prototype.getFullURL = function (env) {
        var _this = this;
        if (this.baseURL != null && this.endPoint != null) {
            var valueFromMulti = function (source) { return typeof source == "function" ? source(env, _this) : source; };
            var result = urlJoin(valueFromMulti(this.baseURL), valueFromMulti(this.endPoint));
            // Strip trailing slash on any url
            if (result.charAt(result.length - 1) == "/") {
                result = result.substr(0, result.length - 1);
            }
            return result;
        }
        return null;
    };
    /**
     * Used to generated a new CallConfig instance
     * Properties are deeply cascaded onto the new instance using
     * the current object, then the passed params
     * By deeply cascaded we mean, properties that are objects are extended, properties that are arrays are joined
     */
    CallConfig.prototype.extend = function (params) {
        return _.assignWith(new CallConfig(), this, params, this.extender);
    };
    return CallConfig;
}(ExtendingObject_1.ExtendingObject));
exports.CallConfig = CallConfig;
