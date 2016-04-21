var CallConfig  = require("beach-day").CallConfig;

// This will create a base call config object we can extend
var config1     = new CallConfig({
    strProp : "www.google.com",
    itemArr : ["a"],
    props   : {e:"123"};
});

// Now lets extend config1 with a new set of properties
// Note config1 will not be modified but instead the
// extend method will return a new instance
var config2     = config1.extend({
    strProp : "www.yahoo.com",
    itemArr : ["b"],
    props   : {d:"456"};
});

// Here we illustrate what the values of config2 will be
config2.strProp == "www.yahoo.com";
config2.itemArr[0] == "a";
config2.itemArr[1] == "b";
config2.props.e == "123";
config2.props.d == "456";

// We can further extend config2 if we so please