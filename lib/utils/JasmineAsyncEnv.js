"use strict";
var JasmineAsyncEnv = (function () {
    function JasmineAsyncEnv() {
        this.failed = false;
    }
    JasmineAsyncEnv.prototype.wrap = function (cb) {
        var _this = this;
        return function (done) {
            _this.done = done;
            if (_this.failed === true) {
                done();
            }
            else {
                cb(_this);
            }
        };
    };
    return JasmineAsyncEnv;
}());
exports.JasmineAsyncEnv = JasmineAsyncEnv;
