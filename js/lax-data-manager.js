var DataManager = (function () {
    
    var colors = {
        vinPath: "#ffffff",
        voutPath: "#ffffff",
        flightsPath: "#ffffff",
        dataPoint: "#ffffff"
    };
    
    var scalars = {
        vehicles: 10000,
        flights: 400
    };
    
    var delays = {
        dataPoints: 1000
    };

    // have data from 2013-05 to 2016-07
    // Stored in the form
    // [ { date: Date, flights: XXX, vin: XXX, vout: XXX } ]
    var data = [];
    
    var margin = {
        top: 20, 
        right: 20, 
        bottom: 50, 
        left: 0
    };
    
    var width, height;
    
    function init(w, h) {
        width = w;
        height = h;
        var flights, vehicles, dates;
        return new Promise(function (resolve, reject) {
            FlightsModule.fetchData().then(function (d) {
                flights = d;
            }).then(function () {
                VehiclesModule.fetchData().then(function (d) {
                    vehicles = d;
                }).then(function () {
                    dates = intersectArrays(flights, vehicles);
                    for (var date of dates) {
                        var obj = { date: new Date(date) };
                        
                        
                        var findDate = function(el) {
                            return Object.keys(el)[0] === date;
                        }
                        
                        var fMatch = flights.find(findDate);
                        var vMatch = vehicles.find(findDate);
                        
                        if (fMatch) {
                            obj.flights = fMatch[date];
                        }
                        
                        if (vMatch) {
                            obj.vin = vMatch[date].entry;
                            obj.vout = vMatch[date].exit;
                        }

                        data.push(obj);
                    }
                    resolve(data);
                });
            });
        });
    }
    
    function plot(selector) {
        
                // Set the domain and ranges for each axis
        var x = d3.scaleTime()
            .range([0, width])
            .domain(d3.extent(data, function(d) { return d.date; }));   
        var y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, function(d) { return d.vin / scalars.vehicles; })]);
        
        // Create a chart on the passed-in selector SVG
        var chart = makeChart(selector);
        var chartdata = chart.append("g")
//                                .append("g")
                                .attr("id", "chartdata");
        
        
        var formatTime = d3.timeFormat("%B %Y");
        
        var div = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        
        // Define the vin line to be graphed
        var vinLine = d3.line()
            .curve(d3.curveCardinal.tension(0.2))
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.vin / scalars.vehicles); });
        
        // Define the vout line to be graphed
        var voutLine = d3.line()
            .curve(d3.curveCardinal.tension(0.2))
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.vout / scalars.vehicles); });
        
        // Define the flight line to be graphed
        var flightsLine = d3.line()
            .curve(d3.curveCardinal.tension(0.2))
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.flights / scalars.flights); });
        
        // Add vin path to graph
        var vinPath = chartdata.append("path")
            .data([data])
            .attr("class", "line")
            .attr("id", "vinPath")
            .attr("d", vinLine)
            .style("stroke", colors.vinPath)
        
        var vinPathLength = vinPath.node().getTotalLength();
        vinPath.style("stroke-dasharray", vinPathLength + " " + vinPathLength)
        .style("stroke-dashoffset", vinPathLength)
        
        // Add vout path to graph
        var voutPath = chartdata.append("path")
            .data([data])
            .attr("class", "line")
            .attr("id", "voutPath")
            .attr("d", voutLine)
            .style("stroke", colors.voutPath)
        
        var voutPathLength = voutPath.node().getTotalLength();
        voutPath.attr("stroke-dasharray", voutPathLength + " " + voutPathLength)
        .attr("stroke-dashoffset", voutPathLength)
        
        // Add flight path to graph
        var path = chartdata.append("path")
            .data([data])
            .attr("class", "line")
            .attr("id", "flightPath")
            .attr("d", flightsLine)
            .attr("stroke", colors.flightsPath)
        
        var pathLength = path.node().getTotalLength();
        path.attr("stroke-dasharray", pathLength + " " + pathLength)
        .attr("stroke-dashoffset", pathLength)
        
        window.setTimeout(function() {
            var rad = 3;
            // Add dots for flights
            
            chart.append("g")
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                    .attr("class", "data-dot")
                    .attr("fill", colors.dataPoint)
                    .attr("cx", function (d) {
                        return x(d.date);
                    }).attr("cy", function (d) {
                        return y(d.flights / scalars.flights);
                    }).on("mouseover", function (d) {
                        div.transition().duration(200).style("opacity", .9);
                        div.html("In " + formatTime(d.date) + ", <br/>" + commafy(d.flights) + " flew through LAX.")
//                            .style("left", "15px")
//                            .style("top", "15 px");
                    }).on("mouseout", function (d) {
                        div.transition().duration(500).style("opacity", 0);
                    });
            
            // Add dots for incoming vehicles
            chart.append("g")
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                    .attr("class", "data-dot")
                    .attr("fill", colors.dataPoint)
                    .attr("cx", function (d) {
                        return x(d.date);
                    }).attr("cy", function (d) {
                        return y(d.vin / scalars.vehicles);
                    }).on("mouseover", function (d) {
                        div.transition().duration(200).style("opacity", .9);
                        div.html("In " + formatTime(d.date) + ", <br/>" + commafy(d.vin) + " cars drove into LAX.")
//                            .style("left", "15px")
//                            .style("top", "15px");
                    }).on("mouseout", function (d) {
                        div.transition().duration(500).style("opacity", 0);
                    });
            
            // Add dots for outgoing vehicles
            chart.append("g")
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                    .attr("fill", colors.dataPoint)
                    .attr("stroke-width", "1px")
                    .attr("r", rad)
                    .attr("cx", function (d) {
                        return x(d.date);
                    }).attr("cy", function (d) {
                        return y(d.vout / scalars.vehicles);
                    }).on("mouseover", function (d) {
                        div.transition().duration(200).style("opacity", .9);
                        div.html("In " + formatTime(d.date) + ", <br/>" + commafy(d.vout) + " cars drove out of LAX.")
//                            .style("left", (d3.event.pageX) + "px")
//                            .style("top", (d3.event.pageY - 28) + "px");
                    }).on("mouseout", function (d) {
                        div.transition().duration(500).style("opacity", 0);
                    });
            
                
        }, delays.dataPoints);
//        addAxes(chart, x, y, "Date", "#");
    }
    
    function makeChart(selector) {
        return d3.select(selector)
//            .attr("width", width)
//            .attr("height", height)
//            .attr("cx", "30")
//            .style("padding-top", "100px")
//            .style("padding-bottom", "100px");
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
    
    function commafy(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
    
    return {
        init: init
        , plot: plot
    }
})();