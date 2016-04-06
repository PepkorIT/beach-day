"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require("lodash");
var ExtendingObject_1 = require("./ExtendingObject");
var urlJoin = require("url-join");
var CallConfig = (function (_super) {
    __extends(CallConfig, _super);
    function CallConfig(params) {
        // Set defaults if not already done
        _super.call(this, { method: "POST", status: 200, timeout: 15000 }, params);
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
    Object.defineProperty(CallConfig.prototype, "fullURL", {
        /**
         * Returns the full api url for running the call
         */
        get: function () {
            return this.baseURL != null && this.endPoint != null ? urlJoin(this.baseURL, this.endPoint) : null;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Used to generated a new CallConfig instance
     * Properties are cascaded onto the new instance using
     * the current object, then the passed params
     */
    CallConfig.prototype.extend = function (params) {
        var inst = new CallConfig();
        return _super.prototype.extend.call(this, inst, params);
    };
    return CallConfig;
}(ExtendingObject_1.ExtendingObject));
exports.CallConfig = CallConfig;
