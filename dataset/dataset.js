const baseDir = "/preprocess/";
const gdpGrowth = "gdp_growth.csv";
const gdpLevel = "gdp_level.csv";
const unemploymentRate = "unemployment_rate.csv";
const eduAttainmentTemplate = "edu_attainment_";
const all = "/all.csv";

d3.csv(all, renderAll);

function renderAll(rawData) {
    feather.replace();
    render(rawData, "processed", "Processed Data");
}

function renderGdpGrowth(rawData) {
    render(rawData, "gdp-growth", gdpGrowth);
    d3.csv(baseDir + gdpLevel, renderGdpLevel);
}

function renderGdpLevel(rawData) {
    render(rawData, "gdp-level", gdpLevel);
    d3.csv(baseDir + unemploymentRate, renderUnemploymentRate);
}

function renderUnemploymentRate(rawData) {
    render(rawData, "unemployment-rate", unemploymentRate);
    for (var i = 2010; i <= 2019; i++) {
        var eduAttainment = eduAttainmentTemplate + i + ".csv";
        d3.csv(baseDir + eduAttainment, renderEduAttainment, function(rawData) {
            render(rawData, "edu-attainment-" + i, eduAttainment);
        });
    }
}

function render(rawData, id, title) {
    var template = 
        "<div class=\"justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom\">" +
        "<h2>" + title + "</h2>" +
        "<div class=\"table-responsive\" style=\"max-height:500px;\">" +
        "<table id=\"" + id + "\" class=\"table table-striped table-sm\">" +
        "<thead><tr><th>#</th></tr></thead><tbody></tbody></table></div></div>";     
    $("#dataset").append(template);
    $.each(rawData.columns, function(key, value) {
        $("#" + id + " thead tr").append("<th>" + value + "</th>");
    });

    $.each(rawData, function(key, value) {
        $("#" + id + " tbody").append("<tr><td>" + key + "</td></tr>");
        $.each(value, function(i, j){
            $("#" + id + " tbody tr:last-child").append("<td>" + j + "</td>");
        });
    });
}