const labels = {
    unemployment_rate: "Unemployment Rate",
    edu_attainment: "Educational Attainment",
    gdp_growth_rate: "GDP Growth Rate",
    low: "Low GDP",
    medium: "Medium GDP",
    high: "High GDP"
};
d3.csv("/all.csv", processData);
var processedData = {
  low: [],
  medium: [],
  high: []
};
function processData(rawData) {

  feather.replace();

  var rawDataByState = d3.nest()
    .key(function(d) { return d["state"] })
    .entries(rawData);

  // sort average gdp
  var averageGdp = [];
  rawDataByState.map(function(row) {
    var vals = row["values"];
    var gdp = 0;
    for (var i = 0; i < vals.length; i++) {
      gdp += +vals[i]["gdp"];
    }
    averageGdp.push({
      state: row["key"],
      average_gdp: gdp / vals.length 
    });
  });

  averageGdp.sort(function(a, b){
    return a["average_gdp"] - b["average_gdp"];
  });

  // category
  var offset = averageGdp.length / 3;
  categorize(rawData, averageGdp.slice(0, offset), "low");
  categorize(rawData, averageGdp.slice(offset, 2*offset), "medium");
  categorize(rawData, averageGdp.slice(2*offset), "high");

  // init
  initialize();

  console.log(processedData);
}

function buildMap(averageGdp) {
  var map = {};
  for (var i = 0; i < averageGdp.length; i++) {
    map[averageGdp[i]["state"]] = averageGdp[i]["average_gdp"];
  }
  return map;
}

function categorize(data, averageGdp, level) {
  var averageGdpMap= buildMap(averageGdp);
  for (var i = 0; i < data.length; i++) {
    var state = data[i]["state"];
    if (averageGdpMap[state] != undefined) {
      processedData[level].push({
        state: state,
        date: +data[i]["date"],
        gdp_growth_rate: +data[i]["gdp_growth_rate"],
        average_gdp: +averageGdpMap[state],
        unemployment_rate: +data[i]["unemployment_rate"],
        edu_attainment: +data[i]["edu_attainment"]
      });
    }
  }
}

function initialize() {

  $(".btn-item").click(function(){
    var level = $(this)[0].id;
    $(".btn-item").removeClass("btn-primary");
    $(".btn-item").addClass("btn-secondary");
    $(this).removeClass("btn-secondary");
    $(this).addClass("btn-primary");
    $("#dropdownMenuButton").text(labels[level] + " ");
    drawScatterPlot(level, "#scatter_svg_edu", "edu_attainment", "unemployment_rate");
    drawScatterPlot(level, "#scatter_svg_gdp", "gdp_growth_rate", "unemployment_rate");
    drawBarChart(level);
  });
  $("#low").click();
}

function drawScatterPlot(level, svgId, xVar, yVar) {

    const width = 550;
    const height = 400;
    const svgWidth = width;
    const svgHeight = height + 150;
    const size = 5;
    const titleHeight = 60;
    const figPadding = 30;
    const xAxisHeight = 60;
    const yAxisWidth = 60;
    const textHeight = 30;
    var xlabel = labels[xVar];
    var ylabel = labels[yVar];
    var data = processedData[level];
    var topPadding = titleHeight + figPadding;
    var leftPadding = figPadding + yAxisWidth;
    var bottomPadding = figPadding + xAxisHeight;
    var w = width - leftPadding - figPadding - 1;
    var h = height - topPadding - bottomPadding;
    var x = linearScale(data, xVar, [0, w]);
    var y = linearScale(data, yVar, [h, 0]);
  
    d3.select(svgId).selectAll("svg").remove();

    var xAxis = d3.axisBottom(x)
      .tickPadding(4)
      .tickSizeOuter(0);
    
    d3.select(svgId)
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .attr("class", "scatter-plot");

    var svg = d3.select(svgId)
      .selectAll(".scatter-plot");

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(" + leftPadding + "," + (h + topPadding) + ")")
      .call(xAxis);
  
    svg.append("text")
      .attr("transform", "translate(" + (leftPadding + w / 2) + " ," + (height - figPadding) + ")")
      .style("text-anchor", "middle")
      .text(xlabel);
  
    svg.append("g")
      .attr("class", "x grid")
      .attr("transform", "translate(" + leftPadding + "," + topPadding + ")")
      .call(xAxis.tickSize(h)
            .tickFormat("")
            .ticks(5));
  
    var yAxis = d3.axisLeft(y)
      .tickSizeOuter(0)
      .ticks(4);
    
    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + leftPadding + "," + topPadding + ")")
      .call(yAxis);
  
    svg.append("text")
      .attr("transform", "rotate(-90)," +"translate(" + (0 - topPadding - h / 2) + " ," + (figPadding + textHeight / 2) + ")")
      .style("text-anchor", "middle")
      .text(ylabel);
  
    svg.append("g")
      .attr("class", "y grid")
      .attr("transform", "translate(" + leftPadding + "," + topPadding + ")")
      .call(yAxis.tickSize(-w).tickFormat(""));
  
    var tooltip = d3.select(svgId)
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "#343a40")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    var mouseover = function(d) { tooltip.style("opacity", 1) }

    var mousemove = function(d) {
        tooltip.html("<table class=\"table table-borderless table-dark\"><tr><td>State</td><td>" + d["state"] + "</td></tr>"
            + "<tr><td>Year</td><td>" + d["date"] + "</td></tr>"            
            + "<tr><td>" + labels[xVar] + "</td><td>" + d[xVar] + " %</td></tr>"
            + "<tr><td>" + labels[yVar]+ "</td><td>" + d[yVar] + " %</td></tr></table>")
        .style("left", (d3.mouse(this)[0]+90) + "px")
        .style("top", (d3.mouse(this)[1]) + "px")
    }

    var mouseleave = function(d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", 0)
    }

    var dots = svg.append("g")
      .selectAll()
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dots")
      .attr("cx", d => leftPadding + x(d[xVar]))
      .attr("cy", d => topPadding + y(d[yVar]))
      .attr("r", size)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);
  
    var color = d3.scaleOrdinal(d3.schemeCategory20);
    color.domain(pointScale(data, "state").domain()); 
    dots = dots.attr("fill", d => color(d.state));

    var legend = svg.append("g")
      .attr("class", "legend")
      .attr(
        "transform", "translate(" + (leftPadding + 100) + "," + (topPadding + height - 50) + ")");

    legend.append("rect")
      .attr("class", "legend-box")
      .attr("x", "-7.5em")
      .attr("y", "-2em")
      .attr("width", 380)
      .attr("height", 120);

    legend.append("text")
      .attr("class", "legend-label")
      .attr("transform", "translate(50,-9)")
      .text("State (" + labels[level] + ")");

    legend = legend.selectAll()
      .data(color.domain())
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr(
        "transform", (d, i) => "translate(" + (i % 3) * 128 + "," + Math.floor(i / 3) * 15 + ")");

    legend.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", color);

    legend.append("text")
      .attr("x", -3)
      .attr("y", 5)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(d => d);
  
    svg.append("text")
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .attr("x", w / 2 + leftPadding)
      .attr("y", figPadding + titleHeight / 2)
      .text(labels[yVar] + " vs. " + labels[xVar]);
  
}

function linearScale(data, field, range) {
  const vals = data.map(d => d[field]);
  const minVal = d3.min(vals);
  const maxVal = d3.max(vals);
  const width = maxVal - minVal;
  const pad = [x => x - 0.03 * width, x => x + 0.03 * width];
  const mi = applyPadding(minVal, pad[0]);
  const ma = applyPadding(maxVal, pad[1]);
  return d3.scaleLinear()
    .domain([mi, ma])
    .range(range);
}

function applyPadding(x, ratio) {
  if (typeof ratio == "function") {
    return ratio(x);
  }
  return x * ratio;
}

function pointScale(data, field, rangeMax, padding = 0.5) {
  var vals = {};
  data.forEach((d) => {
    vals[d[field]] = 0 || vals[d[field]];
    vals[d[field]] += 1;
  });
  return d3.scalePoint()
    .domain(Object.keys(vals).sort())
    .range([0, rangeMax])
    .padding(padding);
}

function drawBarChart(level) {
  d3.select("#bar_svg").selectAll("svg").remove();

  var data = processedData[level];
  var margin = { top: 80, right: 40, bottom: 120, left: 90 };
  var width = 700 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;

  var x = d3.scaleBand()
      .range([0, width])
      .padding(0.065);
  var y = d3.scaleLinear().range([height, 0]);

  var barSvg = d3.select("#bar_svg")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(data.map(function(d) { return d["state"]; }));
  y.domain([0, d3.max(data, function(d) { return d["average_gdp"]; })]);

  var xAxis = d3.axisBottom().scale(x);
  var yAxis = d3.axisLeft().scale(y);

  barSvg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.6em")
      .attr("transform", "rotate(-80)");

  barSvg.append("text")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("State (" + labels[level] + ")");        

  barSvg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0, 0)")
      .call(yAxis);

  barSvg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Average GDP");

  barSvg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .style("fill", "steelblue")
      .attr("x", function(d) { return x(d["state"]); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d["average_gdp"]); })
      .attr("height", function(d) { return height - y(d["average_gdp"]) })
}
