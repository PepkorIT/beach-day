var Jasmine = require("jasmine");
var jasmine = new Jasmine();


// Load the config file
jasmine.loadConfigFile("spec/jasmine.json");

console.log("Running new JASMINE Suite :)");




jasmine.execute();