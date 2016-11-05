var DataManager = (function (maxWidth, maxHeight) {

    // have data from 2013-05 to 2016-07
    // Stored in the form
    // [ { date: Date, flights: XXX, vin: XXX, vout: XXX } ]
    var data = [];
    
    var margin = {top: 20, right: 20, bottom: 50, left: 100},
    width = maxWidth - margin.left - margin.right,
    height = maxHeight - margin.top - margin.bottom;
    
    function downloadData() {
        var flights, vehicles, dates;
        return new Promise(function (resolve, reject) {
            flightsModule.fetchData().then(function () {
                flights = flightsModule.allCounts();
            }).then(function () {
                vehiclesModule.fetchData().then(function () {
                    vehicles = vehiclesModule.allCounts();
                }).then(function () {
                    // Create local data structure
                    dates = intersectArrays(flights, vehicles);
                    for (var date of dates) {
                        var obj = {}
                        obj.date = new Date(date);
                        obj.flights = flightsModule.forMonth(date);
                        var v = vehiclesModule.forMonth(date);
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
        chart.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", flightsLine)
            .style("stroke", "#00f");
        
        addAxes(chart, x, y, "Date", "No. of Flights");
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
        
        chart.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", vinLine)
            .style("stroke", "#0f0");
        chart.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", voutLine)
            .style("stroke", "#f00");
        
        addAxes(chart, x, y, "Date", "No. of Vehicles");
        
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
        downloadData: downloadData
        , plotVehicles: plotVehicles
        , plotFlights: plotFlights
    }
})(800, 400);

$(document).ready(function() {
    DataManager.downloadData().then(function () {
    DataManager.plotVehicles("#vehicles-chart");
    DataManager.plotFlights("#flights-chart");
});
});
