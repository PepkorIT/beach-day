import * as _ from "lodash";

export class ExtendingObject<T,I> {

    constructor(defaults:I, params?:I){
        // Note sources are applied from right to left, which makes no sense of course
        if (params) _.assignInWith(this, params, defaults, this.extender);
    }
    public extend(instance:T, params:I):T {
        // Note sources are applied from right to left, which makes no sense of course
        _.assignInWith(<{}> instance, params, this, this.extender);
        return instance;
    }
    extender = (objectValue: any, sourceValue: any, key?: string, object?: any, source?: any) => {
        if (objectValue instanceof Array){
            return [].concat(sourceValue).concat(objectValue);
        }
        return _.isUndefined(objectValue) ? sourceValue : objectValue;
    };
}