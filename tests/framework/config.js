"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var call_config_1 = require("../../lib/network/call-config");
var config = new call_config_1.CallConfig();
config.requestCallback = function (error, response, body) {
    return new Promise(function () {
    });
};
