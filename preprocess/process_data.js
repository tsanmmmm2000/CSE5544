d3.csv("gdp_growth.csv", processGdpGrowth);
var dates = [ 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019 ];
var processedData = {};
var blacklist = ["United States", "New England", "Mideast", "Great Lakes", "Plains", 
"Southeast", "Southwest", "Rocky Mountain", "Far West"];

function getProcessedData() {
  return processedData;
}

function processGdpGrowth(rawData) {
  var rawDataByState = d3.nest()
    .key(function(d) { return d["GeoName"] })
    .entries(rawData);

    rawDataByState.map(function(row) {
      if (!inBlackList(row["key"])) {
        for (var i = 0; i < dates.length; i++) {
          var date = dates[i];
          var prevDate = date - 1;
          var range = prevDate + "-" + date;
          var gdp = row["values"][0][range];
          if (processedData[date] == undefined) {
            processedData[date] = [];
          }
          processedData[date].push({
            state: row["key"],
            gdp_growth_rate: +gdp,
            gdp: 0,
            unemployment_rate: 0,
            edu_attainment: 0,   
          });        
        }
      }
    });

    d3.csv("gdp_level.csv", processGdpLevel);
}

function processGdpLevel(rawData) {
  var rawDataByState = d3.nest()
    .key(function(d) { return d["GeoName"] })
    .entries(rawData);

  rawDataByState.map(function(row) {
    for (var i = 0; i < dates.length; i++) {
      var date = dates[i];
      var gdp = row["values"][0][date];
      for (var j = 0; j < processedData[date].length; j++) {
        var state = processedData[date][j]["state"];
        if(row["key"] == state) {
          processedData[date][j]["gdp"] = +gdp;
          break;
        }
      }        
    }
  });

  d3.csv("unemployment_rate.csv", processUnemploymentRate);
}

function processUnemploymentRate(rawData) {
  var rawDataByDate = d3.nest()
    .key(function(d) { return d["Year"] + "-" + d["Month"] })
    .entries(rawData);
    
    var rateByYear = {};
    rawDataByDate.map(function(row) {
      var vals = row["values"];
      var date = row["key"].split("-")[0];
      if (date >= dates[0] && date <= dates[dates.length - 1]) {
        if (rateByYear[date] == undefined) {
          rateByYear[date] = [];
        }
        for (var i = 0; i < vals.length; i++) {
          var state = vals[i]["State and area"];
          var total = +vals[i]["Civilian labor force Total"];
          var unemploymentTotal = +vals[i]["Civilian labor force Unemployment Total"];   
          if (rateByYear[date][state] == undefined) {
            rateByYear[date][state] = [];
            rateByYear[date][state] = { total: 0, unemployment_total: 0 };
          }
          rateByYear[date][state]["total"] += total;
          rateByYear[date][state]["unemployment_total"] += unemploymentTotal;
        }
      }
    });

    for (var i = 0; i < dates.length; i++) {
      var date = dates[i];
      for (var j = 0; j < processedData[date].length; j++) {
        var state = processedData[date][j]["state"];
        if(rateByYear[date][state] != undefined) {
          var rate = (rateByYear[date][state]["unemployment_total"] / rateByYear[date][state]["total"]) * 100;
          processedData[date][j]["unemployment_rate"] = +rate.toFixed(2);
        }
      } 
    }
    processEduRate(dates.length - 1);
}


function processEduRate(index) {
  if (index < 0) {
    
    console.log(processedData);
    $("body").append("<div>" + JSON.stringify(processedData) + "</div>");
    
    // output to csv file
    // outputAll();
    // outputOneByOne();
    return;
  }
  var date = dates[index];
  var splitDate = 2018;
  // 2010-2017
  // S1501_C01_001E: Population 18 to 24 years
  // S1501_C02_005E: Percent!!Population 18 to 24 years!!Bachelor's degree or higher
  // S1501_C01_006E: Population 25 years and over
  // S1501_C02_015E: Percent!!Population 25 years and over!!Bachelor's degree or higher
  
  // 2018-2019
  // S1501_C01_001E: Population 18 to 24 years
  // S1501_C01_005E: Population 18 to 24 years!!Bachelor's degree or higher
  // S1501_C01_006E: Population 25 years and over
  // S1501_C01_015E: Population 25 years and over!!Bachelor's degree or higher
  var needToCal = (date < splitDate);
  d3.csv("edu_attainment_" + date + ".csv", function(rawData) {
    rawData.map(function(row) {
      var state = row["NAME"];
      for (var j = 0; j < processedData[date].length; j++) {
        if(processedData[date][j]["state"] == state) {
          var eighteen = +row["S1501_C01_001E"];
          var eighteenBachelor = needToCal 
            ? eighteen * (+row["S1501_C02_005E"] / 100)
            : +row["S1501_C01_005E"];
          var twentyFour = +row["S1501_C01_006E"];
          var twentyFourBachelor = needToCal 
            ? twentyFour * (+row["S1501_C02_015E"] / 100)
            : +row["S1501_C01_015E"];
          var edu = ((eighteenBachelor + twentyFourBachelor) / (eighteen + twentyFour)) * 100;
          processedData[date][j]["edu_attainment"] = +edu.toFixed(2);
        }
      }
    });
    processEduRate(index - 1);
  });
}

function inBlackList(state) {
  for (var i = 0; i < blacklist.length; i++) {
    if (blacklist[i] == state) {
      return true;
    }
  }
  return false;
}

function outputAll() {
  var data = [];
  for (var i = 0; i < dates.length; i++) {
    var date = dates[i];
    for (var j = 0; j < processedData[date].length; j++) {
      processedData[date][j]['date'] = date;
      data.push(processedData[date][j]);
    }
  }
  outputCsv(
    "all", 
    data, 
    ['state', 'date', 'gdp', 'gdp_growth_rate', 'unemployment_rate', 'edu_attainment']);
}

function outputOneByOne() {
  for (var i = 0; i < dates.length; i++) {
    var date = dates[i];
    outputCsv(
      date, 
      processedData[date], 
      ['state', 'gdp', 'gdp_growth_rate', 'unemployment_rate', 'edu_attainment']);
  }
}

function outputCsv(fileName, data, title) {
  JSonToCSV.setDataConver({
    data: data,
    fileName: fileName,
    columns: {
      title: title,
      key: title,
      formatter: function(n, v) {
        if(n === 'amont' && !isNaN(Number(v))) {
          v = v + '';
          v = v.split('.');
          v[0] = v[0].replace(/(\d)(?=(?:\d{3}) $)/g, '$1,');
          return v.join('.');
        }
        if(n === 'proportion') return v  + '%';
      }
    }
  });
}