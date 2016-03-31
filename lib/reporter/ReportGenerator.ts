import * as fs from "fs";
import { IDataStore, ReporterConfig } from "./BeachDayReporter";
import * as sass from "node-sass";
import * as mustache from "mustache";
import * as _ from "lodash";

export function generate(viewModel?:IDataStore, config?:ReporterConfig):void {
    var opts = {encoding:"utf8"};

    if (viewModel == null && config == null){
        config              = new ReporterConfig();
        var strData:string  = fs.readFileSync(config.viewDataPath, opts);
        viewModel           = JSON.parse(strData);
        console.log("----> Using default config & data to test report: \n", config);
    }

    // First lets load up all the templates
    var headerStr   = fs.readFileSync(config.headerTemplatePath, opts);
    var indexStr    = fs.readFileSync(config.indexTemplatePath, opts);
    var suiteStr    = fs.readFileSync(config.suiteTemplatePath, opts);
    var titleStr    = fs.readFileSync(config.titleTemplatePath, opts);
    var summaryStr  = fs.readFileSync(config.summaryTemplatePath, opts);
    var latestStr   = fs.readFileSync(config.latestTemplatePath, opts);

    // Lets convert the scss into CSS
    var stylesStr   = sass.renderSync({
        file        : config.stylesPath,
        outputStyle : "expanded",
        indentWidth : 4
    }).css.toString();

    // Now lets build up the templates to pass
    var partials    = {header: headerStr, title:titleStr, suite:suiteStr, summary:summaryStr};

    // Now the model
    _.extend(viewModel, {
        styles      : stylesStr,
        title       : config.reportName
    });

    // Render with mustache
    var reportResult        = mustache.render(indexStr, viewModel, partials);
    var latestResult        = mustache.render(latestStr, {latestReportName:config.latestReportName});

    // Write out the report
    if (!fs.existsSync(config.reportDir)){
        fs.mkdirSync(config.reportDir);
    }
    if (config.reportDynamicPath) fs.writeFileSync(config.reportDynamicPath, reportResult, opts);
    fs.writeFileSync(config.reportStaticPath, reportResult, opts);
    fs.writeFileSync(config.reportDir + "/latest.html", latestResult, opts);
}