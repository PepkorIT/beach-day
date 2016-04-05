var gulp    = require("gulp");
var ts      = require("gulp-typescript");
var concat  = require("gulp-concat");

// Simple task to generate the .d.ts files for export
gulp.task("tsd-gen", function(){
    // Override the declaration to make sure we generate declaration files
    var tsProject = ts.createProject("tsconfig.json", {
        declaration         : true,
        moduleResolution    : "node",
        out                 : "index.js"
    });

    // Prune out the test files
    var newFiles = [];
    tsProject.config.files.forEach(function(item){
        if (item.indexOf("tests/") != 0 && item != "test_boot.ts") newFiles.push(item);
    });
    tsProject.config.files = newFiles;

    console.log("Generating .d.ts files for dist");

    return tsProject.src()
        .pipe(ts(tsProject))
        .dts
        .pipe(gulp.dest("./lib"));
});

gulp.task("merge-tsd", ["tsd-gen"], function(){
    /*return gulp
        .src(["./lib/custom_typings/!**!/!*.d.ts", "./lib/index.d.ts"])
        .pipe(concat("index.d.ts"))
        .pipe(gulp.dest("./"))*/
});

gulp.task("default", ["merge-tsd"]);