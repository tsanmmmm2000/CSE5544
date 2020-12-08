const fipsToAbbr = {
    '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO', '09': 'CT',
    '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA',
    '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS', '29': 'MO',
    '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH', '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH',
    '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
    '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI', '56': 'WY'
};

const fipsToState = {
    "01": "Alabama",
    "02": "Alaska",
    "04": "Arizona",
    "05": "Arkansas",
    "06": "California",
    "08": "Colorado",
    "09": "Connecticut",
    "10": "Delaware",
    "11": "District of Columbia",
    "12": "Florida",
    "13": "Georgia",
    "15": "Hawaii",
    "16": "Idaho",
    "17": "Illinois",
    "18": "Indiana",
    "19": "Iowa",
    "20": "Kansas",
    "21": "Kentucky",
    "22": "Louisiana",
    "23": "Maine",
    "24": "Maryland",
    "25": "Massachusetts",
    "26": "Michigan",
    "27": "Minnesota",
    "28": "Mississippi",
    "29": "Missouri",
    "30": "Montana",
    "31": "Nebraska",
    "32": "Nevada",
    "33": "New Hampshire",
    "34": "New Jersey",
    "35": "New Mexico",
    "36": "New York",
    "37": "North Carolina",
    "38": "North Dakota",
    "39": "Ohio",
    "40": "Oklahoma",
    "41": "Oregon",
    "42": "Pennsylvania",
    "44": "Rhode Island",
    "45": "South Carolina",
    "46": "South Dakota",
    "47": "Tennessee",
    "48": "Texas",
    "49": "Utah",
    "50": "Vermont",
    "51": "Virginia",
    "53": "Washington",
    "54": "West Virginia",
    "55": "Wisconsin",
    "56": "Wyoming"
};

const stateToFips = {
    "Alabama": "01",
    "Alaska": "02",
    "Arizona": "04",
    "Arkansas": "05",
    "California": "06",
    "Colorado": "08",
    "Connecticut": "09",
    "Delaware": "10",
    "District of Columbia": "11",
    "Florida": "12",
    "Georgia": "13",
    "Hawaii": "15",
    "Idaho": "16",
    "Illinois": "17",
    "Indiana": "18",
    "Iowa": "19",
    "Kansas": "20",
    "Kentucky": "21",
    "Louisiana": "22",
    "Maine": "23",
    "Maryland": "24",
    "Massachusetts": "25",
    "Michigan": "26",
    "Minnesota": "27",
    "Mississippi": "28",
    "Missouri": "29",
    "Montana": "30",
    "Nebraska": "31",
    "Nevada": "32",
    "New Hampshire": "33",
    "New Jersey": "34",
    "New Mexico": "35",
    "New York": "36",
    "North Carolina": "37",
    "North Dakota": "38",
    "Ohio": "39",
    "Oklahoma": "40",
    "Oregon": "41",
    "Pennsylvania": "42",
    "Rhode Island": "44",
    "South Carolina": "45",
    "South Dakota": "46",
    "Tennessee": "47",
    "Texas": "48",
    "Utah": "49",
    "Vermont": "50",
    "Virginia": "51",
    "Washington": "53",
    "West Virginia": "54",
    "Wisconsin": "55",
    "Wyoming": "56"
};

const time = ["2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019"];
const colorList = {
    'ur': ['#0000FF', '#8080FF', '#FF8080', '#FF0000'],
    'ea': ['#FFFFCC', '#FFFF99', '#FF9933', '#CC6600'],
    'gg': ['#FF3333', '#33FF99', '#00FF00', '#009900']
};

var timeValue = "2010";
var domainList = {
    'ur': [0, 10],
    'ea': [25, 30],
    'gg': [-1.1, 3.3]
};

var urColor = d3.scaleQuantize()
    .domain(domainList['ur'])
    .range(colorList['ur']);
var eaColor = d3.scaleQuantize()
    .domain(domainList['ea'])
    .range(colorList['ea']);
var ggColor = d3.scaleQuantize()
    .domain(domainList['gg'])
    .range(colorList['gg']);

var mapTopic = 'ur';

function drawMap(geoData, dataByYear, year, dataByState) {
    // slider
    d3.select("#timeslide").on("input", function () {
        timeValue = time[+this.value];
        updateMap(dataByYear);
    });

    // button
    d3.select("#btn_ur").on('click', function () {
        mapTopic = 'ur';
        updateMap(dataByYear);
    });
    d3.select("#btn_ea").on('click', function () {
        mapTopic = 'ea';
        updateMap(dataByYear);
    });
    d3.select("#btn_gg").on('click', function () {
        mapTopic = 'gg';
        updateMap(dataByYear);
    });

    // map     
    var margin = { top: 0, right: 0, bottom: 0, left: 0 },
        width = 760 - margin.left - margin.right,
        height = 460 - margin.top - margin.bottom;

    var map_svg = d3.select('#map_svg').append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function scale(scaleFactor) {
        return d3.geoTransform({
            point: function (x, y) {
                this.stream.point(x * scaleFactor, y * scaleFactor);
            }
        });
    }
    var geoGenerator = d3.geoPath().projection(scale(0.75));

    var mapInfo = d3.select("body").append("div")
        .attr("class", "tooltip-donut")
        .style("opacity", 0);

    map_svg.selectAll('path')
        .data(topojson.feature(geoData, geoData.objects.states).features)
        .enter()
        .append('path')
        .attr('d', geoGenerator)
        .attr('id', function (d) {
            return "map_" + d.id;
        })
        .attr('class', 'map_path')
        .style('fill', function (d) {
            var stateStr = fipsToState[d.id];
            for (var i = 0; i < dataByYear[year].length; i++) {
                if (dataByYear[year][i].state == stateStr) {
                    return urColor(+dataByYear[year][i].unemployment_rate)
                }
            }
            return "rgb(0, 256, 0)";
        })
        .on("click", function(d) {
            updateLineGraph(selectedGraph, fipsToState[d.id], dataByState);
        })
        .on('mouseover', function (d) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.85');
            mapInfo.transition()
                .duration(50)
                .style("opacity", 1);
            var stateStr = fipsToState[d.id];
            var textdata;
            for (var i = 0; i < dataByYear[year].length; i++) {
                if (dataByYear[year][i].state == stateStr) {
                    if(mapTopic == 'ur') textdata = (dataByYear[year][i].unemployment_rate);
                    else if(mapTopic == 'ea') textdata = dataByYear[year][i].edu_attainment;
                    else if(mapTopic == 'gg') textdata = dataByYear[year][i].gdp_growth_rate;
                    break;
                }
            }
            textdata = String(textdata.toFixed(2));
            mapInfo.html(stateStr + '<br>' + textdata + '%')
                .style("left", d3.event.pageX + "px")
                .style("top", d3.event.pageY + "px");
        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1');
            mapInfo.transition()
                .duration('50')
                .style("opacity", 0);
        });

    map_svg.selectAll('text')
        .data(topojson.feature(geoData, geoData.objects.states).features)
        .enter()
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('opacity', 0.5)
        .text(function (d) {
            return fipsToAbbr[d.id];
        })
        .attr('transform', function (d) {
            var center = geoGenerator.centroid(d);
            return 'translate (' + center + ')';
        });

    // Legend.
    var legend = map_svg.selectAll("g.legend")
        .data([0, 1, 2, 3])
        .enter().append("svg:g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(630," + (i * 20 + 360) + ")"; });

    legend.append("svg:circle")
        .attr("id", function(d, i) {
            return "legend_cir" + String(i);
        })
        .style("fill", function(d, i) {
            return colorList[mapTopic][i];
        })
        .attr("r", 3);

    legend.append("svg:text")
        .attr("id", function(d, i) {
            return "legend_text" + String(i);
        })
        .attr("x", 12)
        .attr("dy", ".31em")
        .text(function (d, i) {
            var period = (domainList[mapTopic][1] - domainList[mapTopic][0])/colorList[mapTopic].length;
            if(i == 0) return '< ' + String((domainList[mapTopic][0] + period).toFixed(2)) + '%';
            else if (i == 3) return '> ' + String((domainList[mapTopic][0] + period*3).toFixed(2)) + '%';
            else return String((domainList[mapTopic][0] + period*i).toFixed(2)) + '% ~ ' + String((domainList[mapTopic][0] + period*(i+1)).toFixed(2)) + '%';
        });
}

function updateMap(dataByYear) {
    // update year
    d3.select("#range").nodes()[0].innerHTML = timeValue;

    // update state text information
    var mapInfo = d3.select(".tooltip-donut");
    d3.selectAll(".map_path")
        .on('mouseover', function (d) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.85');
            mapInfo.transition()
                .duration(50)
                .style("opacity", 1);
            var stateStr = fipsToState[this.id.substr(4, 5)];
            var textdata;
            for (var i = 0; i < dataByYear[timeValue].length; i++) {
                if (dataByYear[timeValue][i].state == stateStr) {
                    if(mapTopic == 'ur') textdata = (dataByYear[timeValue][i].unemployment_rate);
                    else if(mapTopic == 'ea') textdata = dataByYear[timeValue][i].edu_attainment;
                    else if(mapTopic == 'gg') textdata = dataByYear[timeValue][i].gdp_growth_rate;
                    break;
                }
            }
            textdata = String(textdata.toFixed(2));
            mapInfo.html(stateStr + '<br>' + textdata + '%')
                .style("left", d3.event.pageX + "px")
                .style("top", d3.event.pageY + "px");
        })
        .on('mouseout', function () {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1');
            mapInfo.transition()
                .duration('50')
                .style("opacity", 0);
        })
    
    // update color of each state
    if (mapTopic == 'ur') {
        d3.select('#map_title').nodes()[0].innerHTML = "Unemployment Rate";
        for (var i = 0; i < dataByYear[timeValue].length; i++) {
            var stateStr = dataByYear[timeValue][i].state;
            var urdata = dataByYear[timeValue][i].unemployment_rate;
            d3.select('#map_' + stateToFips[stateStr])
                .style('fill', urColor(+urdata));
        }
    }
    else if (mapTopic == 'ea') {
        d3.select('#map_title').nodes()[0].innerHTML = "Education Attainment";
        for (var i = 0; i < dataByYear[timeValue].length; i++) {
            var stateStr = dataByYear[timeValue][i].state;
            d3.select('#map_' + stateToFips[stateStr])
                .style('fill', eaColor(+dataByYear[timeValue][i].edu_attainment));
        }
    }
    else if (mapTopic == 'gg') {
        d3.select('#map_title').nodes()[0].innerHTML = "GDP growth";
        for (var i = 0; i < dataByYear[timeValue].length; i++) {
            var stateStr = dataByYear[timeValue][i].state;
            d3.select('#map_' + stateToFips[stateStr])
                .style('fill', ggColor(+dataByYear[timeValue][i].gdp_growth_rate));
        }
    }

    // update legend
    var period = (domainList[mapTopic][1] - domainList[mapTopic][0])/colorList[mapTopic].length;
        for(var i = 0; i < colorList[mapTopic].length; i++) {
            d3.select('#legend_cir' + String(i))
                .style('fill', colorList[mapTopic][i]);
            if(i == 0) {
                d3.select('#legend_text' + String(i))
                    .text('< ' + String((domainList[mapTopic][0] + period).toFixed(2)) + '%');
            }
            else if(i == 3) {
                d3.select('#legend_text' + String(i))
                    .text('> ' + String((domainList[mapTopic][0] + period*3).toFixed(2)) + '%');
            }
            else {
                d3.select('#legend_text' + String(i))
                    .text(String((domainList[mapTopic][0] + period*i).toFixed(2)) + '% ~ ' + String((domainList[mapTopic][0] + period*(i+1)).toFixed(2)) + '%');
            }
        }
}