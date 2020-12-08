// modify by Tsan-Ming Lu
// from 'http://localhost:8888/all.csv' to '../all.csv'
var dataurl = '../all.csv';
var mapurl = 'https://d3js.org/us-10m.v1.json';
const state_names = ["Alaska", "Alabama", "Arkansas", "Arizona", "California", "Colorado", "Connecticut", "District of Columbia",
    "Delaware", "Florida", "Georgia", "Hawaii", "Iowa", "Idaho", "Illinois", "Indiana", "Kansas", "Kentucky", "Louisiana",
    "Massachusetts", "Maryland", "Maine", "Michigan", "Minnesota", "Missouri", "Mississippi", "Montana", "North Carolina",
    "North Dakota", "Nebraska", "New Hampshire", "New Jersey", "New Mexico", "Nevada", "New York",
    "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee",
    "Texas", "Utah", "Virginia", "Vermont", "Washington", "Wisconsin", "West Virginia", "Wyoming"]


d3.csv(dataurl, function (error, data) {
    d3.json(mapurl, function (error, geoData) {
        var time = ["2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019"];
        var dataByYear = {};
        var dataByState = {};
        for (var i = 0; i < time.length; i++) {
            var t = time[i];
            var obj = [];
            for (var j = 0; j < data.length; j++) {
                if (data[j].date == t) {
                    var tmp = { "state": data[j].state, "gdp": +data[j].gdp, "gdp_growth_rate": +data[j].gdp_growth_rate, "edu_attainment": +data[j].edu_attainment, "unemployment_rate": +data[j].unemployment_rate };
                    obj.push(tmp);
                }
            }
            dataByYear[t] = obj;
        }

        for (var i = 0; i < state_names.length; i++) {
            var s = state_names[i];
            var obj = [];
            dataByState[s] = obj;
        }
        for (var i = 0; i < data.length; i++) {
            var tmp = { "year": data[i].date, "gdp": +data[i].gdp, "gdp_growth_rate": +data[i].gdp_growth_rate, "edu_attainment": +data[i].edu_attainment, "unemployment_rate": +data[i].unemployment_rate };
            dataByState[data[i].state].push(tmp);
        }
        console.log(dataByState);
        drawMap(geoData, dataByYear, time[0], dataByState);
        drawLineGraph(1, 'Ohio', dataByState);
        drawLineGraph(2, 'California', dataByState);
    });
});