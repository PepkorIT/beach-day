export default class ObjectUtils {


    public static getProp(source:Object|Array<any>, propertyAccessor:string):any {
        if (source == null) return null;

        var currObject  = source;
        var parts       = propertyAccessor.split(".");

        for (var i = 0; i < parts.length; i++){
            var part    = parts[i];
            if (part == "") continue;

            // If its an array selector
            if (part.indexOf("[") != -1){
                // Assign the variable if present
                var varName = part.replace(/\[.+\]/g, "");
                if (varName != ""){
                    currObject = currObject[varName];
                    if (currObject == null || !(currObject instanceof Array)){
                        //console.log("null curr obj: ", varName, currObject instanceof Array);
                        currObject = null;
                        break;
                    }
                }

                // Get only the number in the index
                var index   = part.substr(part.indexOf("[") + 1).replace(/\]/g, "");
                //console.log(">>>>>>>>>> ", index);
                if (isNaN(Number(index))) throw new Error("Invalid array index: " + index);
                currObject  = currObject[Number(index)];
            }
            // Should have array selector in the part if the source is an array
            else if (currObject instanceof Array && part != "length"){
                console.log("Error on array selector");
                if (i == 0){
                    parts.unshift("[missing here]");
                }
                else{
                    parts[i - 1] = parts[i - 1] + "[missing here]";
                }
                throw new Error("Invalid property selection. We encountered an array in the property selection but the next property selector in the string was not []: " + parts.join("."));
            }
            else{
                currObject = currObject[part];
            }
            if (currObject == null) break;
        }
        return currObject;
    }
}