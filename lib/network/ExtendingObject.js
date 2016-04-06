"use strict";
var _ = require("lodash");
var ExtendingObject = (function () {
    function ExtendingObject(defaults, params) {
        this.extender = function (objectValue, sourceValue, key, object, source) {
            if (objectValue instanceof Array) {
                return [].concat(sourceValue).concat(objectValue);
            }
            else if (typeof objectValue == "object") {
                return _.extend({}, sourceValue, objectValue);
            }
            return _.isUndefined(objectValue) ? sourceValue : objectValue;
        };
        // Note sources are applied from right to left, which makes no sense of course
        if (params)
            _.assignInWith(this, params, defaults, this.extender);
    }
    ExtendingObject.prototype.extend = function (instance, params) {
        // Note sources are applied from right to left, which makes no sense of course
        _.assignInWith(instance, params, this, this.extender);
        return instance;
    };
    return ExtendingObject;
}());
exports.ExtendingObject = ExtendingObject;
