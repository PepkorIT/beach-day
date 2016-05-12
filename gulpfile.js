var gulp        = require("gulp");
var jsdoc       = require("gulp-jsdoc3");
var packageJson = require("./package.json");


gulp.task("default", function (cb) {
    var config = require("./jsdoc.json");
    gulp
        .src(["lib/**/*.js"], {read: false})
        .pipe(jsdoc(config, cb));
});