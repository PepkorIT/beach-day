import ObjectUtils from "./ObjectUtils";
import {TestUtils} from "./TestUtils";


export class MatcherUtils {

    public static checkProp(currentBody:any, propertyName:string):any {
        if (propertyName == null) throw new Error("propertyName cannot be null");

        if (currentBody == null){
            expect(currentBody).throwExpectError("Expected property '" + propertyName + "' to be present on response but response was " + currentBody);
        }
        else{
            var currObject  = ObjectUtils.getProp(currentBody, propertyName);
            if (currObject == null){
                expect(currentBody).throwExpectError("Expected property '" + propertyName + "' to be present on response but failed to locate it");
            }
            return currObject;
        }
    }

    public static checkPropDoesntExist(currentBody:any, propertyName:string):any {
        if (propertyName == null) throw new Error("propertyName cannot be null");

        var currObject  = ObjectUtils.getProp(currentBody, propertyName);
        if (currObject != null){
            TestUtils.throwExpectError("Expected property '" + propertyName + "' NOT to be present on response");
        }
        return currObject;
    }

    public static expectProp(currentBody:any, propertyName:string, expected:any, useExplicitEquality:boolean = false):any {
        if (propertyName == null) throw new Error("propertyName cannot be null");

        if (currentBody == null){
            TestUtils.throwExpectError(`Expected property '${propertyName}' to be present on response but response was ${currentBody}`);
        }
        else{
            var value = ObjectUtils.getProp(currentBody, propertyName, false);
            if (!useExplicitEquality && value != expected){
                TestUtils.throwExpectError(`Expected property '${propertyName}' with value: ${value} to be: ${expected}`);
            }
            else if (useExplicitEquality && value !== expected){
                TestUtils.throwExpectError(`Expected property '${propertyName}' with value: ${value} to be: ${expected}`);
            }
            return value;
        }
    }
}