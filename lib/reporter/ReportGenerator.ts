import * as fs from "fs";
import { IDataStore, ReporterConfig } from "./BeachDayReporter";
import * as sass from "node-sass";
import * as mustache from "mustache";

export function generate(viewModel?:IDataStore, config?:ReporterConfig):void {
    var opts = {encoding:"utf8"};

    if (viewModel == null && config == null){
        config              = new ReporterConfig();
        var strData:string  = fs.readFileSync(config.viewDataPath, opts);
        viewModel           = JSON.parse(strData);
        console.log("----> Using default config & data to test report: \n", config);
    }

    // First lets load up all the templates
    var headerStr       = fs.readFileSync(config.headerTemplatePath, opts);
    var indexStr        = fs.readFileSync(config.indexTemplatePath, opts);
    var reportTreeStr   = fs.readFileSync(config.reportTreeTemplatePath, opts);
    var titleStr        = fs.readFileSync(config.titleTemplatePath, opts);

    // Lets convert the scss into CSS
    var stylesStr       = sass.renderSync({
        file        : config.stylesPath,
        outputStyle : "expanded",
        indentWidth : 4
    }).css.toString();

    //console.log("Styles:\n", stylesStr);

    // Now lets build up the templates to pass
    var partials = {header: headerStr, title:titleStr, reportTree:reportTreeStr};

    // Now the model
    var model    = {styles:stylesStr, tree:viewModel};

    // Render with mustache
    var result   = mustache.render(indexStr, model, partials);

    // Write out the report
    fs.writeFileSync(config.reportPath, result, opts);
}