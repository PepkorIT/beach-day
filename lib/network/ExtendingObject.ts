import * as _ from "lodash";

export class ExtendingObject<T,I> {

    constructor(params?:I){
        if (params) _.assignInWith(this, params, this.extender);
    }
    public extend(instance:T, params:I):T {
        _.assignInWith(<{}> instance, this, params, this.extender);
        return instance;
    }
    extender = (objectValue: any, sourceValue: any, key?: string, object?: any, source?: any) => {
        if (objectValue instanceof Array){
            return [].concat(sourceValue).concat(objectValue);
        }
        return _.isUndefined(objectValue) ? sourceValue : objectValue;
    };
}