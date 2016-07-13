"use strict";
var SwaggerUtils_1 = require("../../lib/utils/SwaggerUtils");
var path = require("path");
fdescribe("SwaggerUtilsTest Tests", function () {
    var converted, rootPath;
    beforeEach(function () {
        var filePath = path.join(__dirname, "assets/swagger-test.json");
        converted = SwaggerUtils_1.SwaggerUtils.parseSwaggerJSON(filePath);
        rootPath = converted["paths"]["/customerCollection/validateCustomerReferenceNumber"]["post"];
        //console.log("rootPath = ", JSON.stringify(rootPath, null, 4));
    });
    it("Test basic required update", function () {
        var parcelObj = rootPath["responses"]["200"]["schema"]["properties"]["parcels"]["items"]["properties"]["parcel"];
        expect(parcelObj["properties"]["dropLabelBarcode"]["type"] instanceof Array).toBe(true);
        expect(parcelObj["properties"]["dropLabelBarcode"]["type"][0]).toBe("string");
        expect(parcelObj["properties"]["dropLabelBarcode"]["type"][1]).toBe("null");
    });
    it("Test x-isnullable update", function () {
        var schema = rootPath["responses"]["200"]["schema"];
        expect(schema["type"] instanceof Array).toBe(true);
        expect(schema["type"][0]).toBe("object");
        expect(schema["type"][1]).toBe("null");
    });
    it("Test non required properties when there is no required array", function () {
        expect(rootPath["responses"]["200"]["schema"]["properties"]["parcels"]["type"] instanceof Array).toBe(true);
        expect(rootPath["responses"]["200"]["schema"]["properties"]["parcels"]["type"][0]).toBe("array");
        expect(rootPath["responses"]["200"]["schema"]["properties"]["parcels"]["type"][1]).toBe("null");
    });
});
