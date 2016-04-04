var gulp    = require("gulp");
var ts      = require("gulp-typescript");

// Simple task to generate the .d.ts files for export
gulp.task("tsd-gen", function(){
    // Override the declaration to make sure we generate declaration files
    var tsProject = ts.createProject("tsconfig.json", {
        declaration: true
    });

    console.log("Generating .d.ts files for dist");

    return tsProject.src()
        .pipe(ts(tsProject))
        .dts
        .pipe(gulp.dest("./"));
});

gulp.task("default", ["tsd-gen"]);