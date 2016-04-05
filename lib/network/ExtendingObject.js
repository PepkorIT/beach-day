"use strict";
var _ = require("lodash");
var ExtendingObject = (function () {
    function ExtendingObject(defaults, params) {
        this.extender = function (objectValue, sourceValue, key, object, source) {
            if (objectValue instanceof Array) {
                return [].concat(sourceValue).concat(objectValue);
            }
            return _.isUndefined(objectValue) ? sourceValue : objectValue;
        };
        if (params)
            _.assignInWith(this, defaults, params, this.extender);
    }
    ExtendingObject.prototype.extend = function (instance, params) {
        _.assignInWith(instance, this, params, this.extender);
        return instance;
    };
    return ExtendingObject;
}());
exports.ExtendingObject = ExtendingObject;
