import * as _ from "lodash";
import {type} from "os";

export class ExtendingObject {

    extender = (destValue: any, sourceValue: any, key?: string, object?: any, source?: any) => {
        let sourcePopulated = sourceValue != null && sourceValue != undefined;
        let destPopulated   = destValue != null && destValue != undefined;
        let bothPopulated   = destPopulated && sourcePopulated;
        let bothArrays      = (destValue instanceof Array && sourceValue instanceof Array);
        let destObject      = typeof destValue == "object" && !(destValue instanceof Array);
        let sourceObject    = typeof sourceValue == "object" && !(sourceValue instanceof Array);
        let bothObjects     = sourceObject && destObject;

        let result:any;
        if (bothArrays && bothPopulated) {
            //if (key == "checkRequestSchema") console.log("array merge");
            result      = [];
            result      = result.concat(destValue);
            result      = result.concat(sourceValue);
        }
        else if (bothPopulated && bothObjects){
            //if (key == "checkRequestSchema") console.log("object merge");
            result = _.extend({}, destValue, sourceValue);
        }
        else if (sourcePopulated && sourceObject){
            result = _.extend({}, destValue, sourceValue);
        }
        else{
            //if (key == "checkRequestSchema") console.log("undefined check");
            result = sourceValue == undefined || sourceValue == null ? destValue : sourceValue;
        }
        //if (key == "checkRequestSchema") console.log(`merge for ${key} result: ${result}. destValue: ${destValue}, sourceValue: ${sourceValue}`);
        return result;
    };
}