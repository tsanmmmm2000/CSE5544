const lineColor = {
    'ur': 'steelblue',
    'ea': 'red',
    'gg': 'green'
}

const dataAbbr = {
    'ur': ['Unemployment', 'Rate'],
    'ea': ['Educational', 'Attainment'],
    'gg': ['GDP growth']
}

var selectedGraph = 1;

function drawLineGraph(graphNum, state, dataByState) {
    // radio button
    d3.selectAll("input[name='line_select']").on("change", function () {
        selectedGraph = +this.value;
    })

    // line graph
    var yDomain = [-5, 40];
    var margin = { top: 20, right: 50, bottom: 80, left: 50 },
        // size is adjusted by Tsan-Ming Lu
        // width from 650 to 600
        // height from 400 to 370
        width = 540 - margin.left - margin.right,
        height = 370 - margin.top - margin.bottom;

    var line_svg = d3.select('#line_svg' + String(graphNum)).append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scaleBand()
        .domain(time)
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain(yDomain)
        .range([height, 0]);

    var urLineGenerator = d3.line()
        .x(function (d) {
            return xScale(d.year);
        })
        .y(function (d) {
            return yScale(d.unemployment_rate);
        });

    var eaLineGenerator = d3.line()
        .x(function (d) {
            return xScale(d.year);
        })
        .y(function (d) {
            return yScale(d.edu_attainment);
        });

    var ggLineGenerator = d3.line()
        .x(function (d) {
            return xScale(d.year);
        })
        .y(function (d) {
            return yScale(d.gdp_growth_rate);
        });

    line_svg.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("fill", "black")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Percent (%)");

    line_svg.append("g")
        .attr("transform", "translate(0," + height * (yDomain[1] / (yDomain[1] - yDomain[0])) + ")")
        .call(d3.axisBottom(xScale));

    line_svg.append("path")
        .attr("fill", "none")
        .attr("stroke", lineColor['ur'])
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("transform", "translate(" + (xScale(time[1]) - xScale(time[0])) / 2 + ", 0)")
        .attr("d", urLineGenerator(dataByState[state]));

    line_svg.append("path")
        .attr("fill", "none")
        .attr("stroke", lineColor['ea'])
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("transform", "translate(" + (xScale(time[1]) - xScale(time[0])) / 2 + ", 0)")
        .attr("d", eaLineGenerator(dataByState[state]));

    line_svg.append("path")
        .attr("fill", "none")
        .attr("stroke", lineColor['gg'])
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("transform", "translate(" + (xScale(time[1]) - xScale(time[0])) / 2 + ", 0)")
        .attr("d", ggLineGenerator(dataByState[state]));

    // Title
    d3.select('#line_title' + String(graphNum))
        .style("font-size", "34px")
        .text(state);

    // Legend.
    var legend = line_svg.selectAll("g.legend")
        .data(["ur", "ea", "gg"])
        .enter().append("svg:g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(" + (50 + i*150) + "," + (height + margin.top) + ")"; });

    legend.append("svg:circle")
        .style("fill", function (d) {
            return lineColor[d];
        })
        .attr("r", 3);

    var leg_text = legend.append("svg:text")
        .attr("x", 12)
        .attr("y", -10);

    leg_text.selectAll("tspan")
        .data(function (d) { return dataAbbr[d]; })
        .enter()
        .append("tspan")
        .attr("x", leg_text.attr("x"))
        .attr("dy", "1em")
        .text(function (d) {
            return d;
        });
}

function updateLineGraph(graphNum, state, dataByState) {
    d3.select('#line_svg' + String(graphNum)).select("svg").remove();
    drawLineGraph(graphNum, state, dataByState);
}