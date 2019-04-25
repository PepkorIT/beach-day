"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CallConfig_1 = require("../../lib/network/CallConfig");
var config = new CallConfig_1.CallConfig();
config.requestCallback = function (error, response, body) {
    return new Promise(function () {
    });
};
