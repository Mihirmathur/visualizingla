var DataManager = (function () {

    // have data from 2013-05 to 2016-07
    // Stored in the form
    // [ { date: Date, flights: XXX, vin: XXX, vout: XXX } ]
    var data = [];
    
    var margin = {top: 20, right: 20, bottom: 50, left: 100};
    var width, height;
    
    function init(w, h) {
        width = w;
        height = h;
        var flights, vehicles, dates;
        return new Promise(function (resolve, reject) {
            FlightsModule.init().then(function (r) {
                flights = r;
            }).then(function () {
                VehiclesModule.init().then(function (r) {
                    vehicles = r;
                }).then(function () {
                    dates = intersectArrays(flights, vehicles);
                    for (var date of dates) {
                        var obj = {}
                        obj.date = new Date(date);
                        
                        // TODO: Get rid of extraneous calls
                        obj.flights = FlightsModule.forMonth(date);
                        var v = VehiclesModule.forMonth(date);
                        obj.vin = v.entry;
                        obj.vout = v.exit;
                        data.push(obj);
                    }
                    resolve("Success!");
                });
            });
        });
    }
    
    function plotFlights(selector) {
        
        var min = d3.min(data, function(d) { return d.flights; });
        var max = d3.max(data, function(d) { return d.flights; });
        var range = max - min;
        
        // Set the domain and ranges for each axis
        var x = d3.scaleTime()
            .range([0, width])
            .domain(d3.extent(data, function(d) { return d.date; }));   
        var y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, function(d) { return d.flights; })]);
        
        // Create a chart on the passed-in selector SVG
        var chart = makeChart(selector);
        
        // Define the flight line to be graphed
        var flightsLine = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.flights); });
        
        // Add path to graph
        var path = chart.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", flightsLine)
            .attr("stroke", "#00f")
        
        var pathLength = path.node().getTotalLength();
        path.attr("stroke-dasharray", pathLength + " " + pathLength)
        .attr("stroke-dashoffset", pathLength)
        
//        addAxes(chart, x, y, "Date", "No. of Flights");
    }
    
    function plotVehicles(selector) {
        
        // Set the domain and ranges for each axis
        var x = d3.scaleTime()
            .range([0, width])
            .domain(d3.extent(data, function(d) { return d.date; }));   
        var y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, function(d) { return d.vin; })]);
        
        // Create a chart on the passed-in selector SVG
        var chart = makeChart(selector);
        
        // Define the vin line to be graphed
        var vinLine = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.vin); });
        
        // Define the vout line to be graphed
        var voutLine = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.vout); });
        
        // Add vin path to graph
        var vinPath = chart.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", vinLine)
            .style("stroke", "#0f0")
        
        var vinPathLength = vinPath.node().getTotalLength();
        vinPath.style("stroke-dasharray", vinPathLength + " " + vinPathLength)
        .style("stroke-dashoffset", vinPathLength)
        
        // Add vout path to graph
        var voutPath = chart.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", voutLine)
            .style("stroke", "#f00")
        
        var voutPathLength = voutPath.node().getTotalLength();
        voutPath.attr("stroke-dasharray", voutPathLength + " " + voutPathLength)
        .attr("stroke-dashoffset", voutPathLength)
        
        addAxes(chart, x, y, "Date", "No. of Vehicles");
        
    }
    
    function plotTogether(selector) {
        
        var vScalar = 10000;
        var fScalar = 400;
                // Set the domain and ranges for each axis
        var x = d3.scaleTime()
            .range([0, width])
            .domain(d3.extent(data, function(d) { return d.date; }));   
        var y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, function(d) { return d.vin / vScalar; })]);
        
        // Create a chart on the passed-in selector SVG
        var chart = makeChart(selector);
        
        var formatTime = d3.timeFormat("%b %Y");
        
        var div = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        
        // Define the vin line to be graphed
        var vinLine = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.vin / vScalar); });
        
        // Define the vout line to be graphed
        var voutLine = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.vout / vScalar); });
        
        // Define the flight line to be graphed
        var flightsLine = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.flights / fScalar); });
        
        // Add vin path to graph
        var vinPath = chart.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", vinLine)
            .style("stroke", "#0f0")
        
        var vinPathLength = vinPath.node().getTotalLength();
        vinPath.style("stroke-dasharray", vinPathLength + " " + vinPathLength)
        .style("stroke-dashoffset", vinPathLength)
        
        // Add vout path to graph
        var voutPath = chart.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", voutLine)
            .style("stroke", "#f00")
        
        var voutPathLength = voutPath.node().getTotalLength();
        voutPath.attr("stroke-dasharray", voutPathLength + " " + voutPathLength)
        .attr("stroke-dashoffset", voutPathLength)
        
        // Add flight path to graph
        var path = chart.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", flightsLine)
            .attr("stroke", "#00f")
        
        var pathLength = path.node().getTotalLength();
        path.attr("stroke-dasharray", pathLength + " " + pathLength)
        .attr("stroke-dashoffset", pathLength)
        
        window.setTimeout(function() {
            var rad = 3;
            chart.selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                .attr("fill", "#000")
                .attr("stroke-width", "1px")
                .attr("r", rad)
                .attr("cx", function (d) {
                    return x(d.date);
                }).attr("cy", function (d) {
                    return y(d.flights / fScalar);
                }).on("mouseover", function (d) {
                    div.transition().duration(200).style("opacity", .9);
                    div.html(formatTime(d.date) + "<br/>" + d.flights).style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
                }).on("mouseout", function (d) {
                    div.transition().duration(500).style("opacity", 0);
                });
            
            chart.selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                .attr("r", rad)
                .attr("cx", function (d) {
                    return x(d.date);
                }).attr("cy", function (d) {
                    return y(d.vin / vScalar);
                }).on("mouseover", function (d) {
                    div.transition().duration(200).style("opacity", .9);
                    div.html(formatTime(d.date) + "<br/>" + d.vin).style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
                }).on("mouseout", function (d) {
                    div.transition().duration(500).style("opacity", 0);
                });
            
            chart.selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                .attr("r", rad)
                .attr("cx", function (d) {
                    return x(d.date);
                }).attr("cy", function (d) {
                    return y(d.vout / vScalar);
                }).on("mouseover", function (d) {
                    div.transition().duration(200).style("opacity", .9);
                    div.html(formatTime(d.date) + "<br/>" + d.vout).style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
                }).on("mouseout", function (d) {
                    div.transition().duration(500).style("opacity", 0);
                });
            
                
        }, 1000);

        
        addAxes(chart, x, y, "Date", "#");
    }
    
    function makeChart(selector) {
        return d3.select(selector)
            .attr("width", width)
            .attr("height", height)
            .attr("cx", "30")
            .style("padding", "100px");
    }
    
    function addAxes(chart, xScale, yScale, xLabel, yLabel) {
        // Add x-axis
        chart.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));
        chart.append("text")
            .attr("transform", 
                  "translate(" + (width/2) + "," + (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .style("fill", "#000")
            .style("font-size", "14px")
            .style("font-family", "Arial, sans-serif")
            .text(xLabel);
        
        // Add y-axis
        chart.append("g")
            .attr("transform", "translate(0, 5)")
            .call(d3.axisLeft(yScale));
        chart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .attr("fill", "#000")
            .style("text-anchor", "middle")
            .text(yLabel);  
    }

    // Return object with data on flights and vehicles in/out for a given month
    function dataForMonth(month) {
        var obj = {};
        obj.flights = flights.find(function (el) {
            return Object.keys(el)[0] === month;
        })[month];
        obj.vehicles = vehicles.find(function (el) {
            return Object.keys(el)[0] === month;
        })[month];
        return obj;
    }
    
    function intersectArrays(a, b) {
        // Create array of concurrent dates
        var aSet = new Set;
        for (var i of a) {
            aSet.add(Object.keys(i)[0]);
        }
        var bSet = new Set;
        for (var i of b) {
            bSet.add(Object.keys(i)[0]);
        }
        var intersection = new Set([...aSet].filter(x => bSet.has(x)))
        return Array.from(intersection);
    }
    
    return {
        init: init
        , plotVehicles: plotVehicles
        , plotFlights: plotFlights
        , plotTogether: plotTogether
    }
})();

$(document).ready(function() {
    DataManager.init(1200, 400).then(function () {
//        DataManager.plotFlights("#flights-chart", $(window).width(), 400);
//        DataManager.plotVehicles("#vehicles-chart");
        DataManager.plotTogether("#flights-chart");
    });
});



//flightsModule.fetchData().then(function(res) {
//   console.log(res); 
//});