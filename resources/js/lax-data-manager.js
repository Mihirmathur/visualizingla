var DataManager = (function () {
    
    var colors = {
        vinPath: "#ffffff",
        voutPath: "#ffffff",
        flightsPath: "#ffffff",
        dataPoint: "rgb(50, 52, 50)"
    };
    
    var scalars = {
        vehicles: 10000,
        flights: 400
    };
    
    var delays = {
        dataPoints: 1000,
        defaultMessage: 0
    };
    
    var DEFAULT_MESSAGE = "Hover over data points for a closer look at specific months."

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
        resetToDefaultMessage();
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
            .range([10, width-10])
            .domain(d3.extent(data, function(d) { return d.date; }));   
        var y = d3.scaleLinear()
            .range([height, 0])
            // TODO: should be generalized
            .domain([0, d3.max(data, function(d) { return d.vin / scalars.vehicles; })]);
        
        // Create a chart on the passed-in selector SVG
        var chart = makeChart(selector);
        var chartdata = chart.append("g")
                                .attr("id", "chartdata");
        
        
        var formatTime = d3.timeFormat("%B %Y");
        
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
        
        // Render data points after paths have been drawn.
        window.setTimeout(function() {
            
            // Add dots for flights
            chart.append("g")
                .attr("id", "flight-dots")
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                    .attr("class", "data-dot")
                    .attr("fill", colors.dataPoint)
                    .attr("cx", function (d) { return x(d.date); })
                    .attr("cy", function (d) { return y(d.flights / scalars.flights); })
                    .on("mouseover", function (d) {
                        updateInfoMessage(formatTime(d.date) + "</br>" +
                                          commafy(d.flights) + " planes flew through LAX.");
                    }).on("mouseout", function (d) {
                        setTimeout(resetToDefaultMessage, delays.defaultMessage);
                    });
            
            // Add dots for incoming vehicles
            chart.append("g")
                .attr("id", "vin-dots")
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                    .attr("class", "data-dot")
                    .attr("fill", colors.dataPoint)
                    .attr("cx", function (d) { return x(d.date); })
                    .attr("cy", function (d) { return y(d.vin / scalars.vehicles); })
                    .on("mouseover", function (d) {
                        updateInfoMessage(formatTime(d.date) + "</br>" + 
                                          commafy(d.vin) + " cars drove into LAX.</p>");
                    }).on("mouseout", function (d) {
                        setTimeout(resetToDefaultMessage, delays.defaultMessage);
                    });
            
            // Add dots for outgoing vehicles
            chart.append("g")
                .attr("id", "vout-dots")
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                    .attr("class", "data-dot")
                    .attr("fill", colors.dataPoint)
                    .attr("cx", function (d) { return x(d.date); }).
                    attr("cy", function (d) { return y(d.vout / scalars.vehicles); })
                    .on("mouseover", function (d) {
                        updateInfoMessage(formatTime(d.date) + "</br>" + 
                                          commafy(d.vout) + " cars drove out of LAX.");
                    }).on("mouseout", function (d) {
                        setTimeout(resetToDefaultMessage, delays.defaultMessage);
                    });
            
                
        }, delays.dataPoints);
        
        addXAxis(chart, x, "Month");
    }
    
    function makeChart(selector) {
        return d3.select(selector)
        .attr("cx", "30")
        .style("padding-top", "100px")
        .style("padding-bottom", "100px");
    }
    
    function updateInfoMessage(message) {
        d3.select("#info-overlay").html("<p>" + message + "</p>");
    }
    
    function resetToDefaultMessage() {
        updateInfoMessage("<p>" + DEFAULT_MESSAGE + "<p>");
    }
    
    function addXAxis(chart, xScale, xLabel) {
        
        var axis = d3.axisBottom(xScale);
        chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(axis)
        
        d3.selectAll(".tick line")
            .attr("stroke-width", 3)
            .attr("y1", -5)
            .attr("y2", 10);
        
        d3.selectAll(".tick text") 
            .attr("class", "label")
            .attr("y", 15)
            .attr("font-size", function(d, i) {
                var label = this.textContent;
                if (isNaN(label)) {
                    return "12px";
                } else {
                    return "18px";
                }
            });
    }
    
    function addYAxis(chart, yScale, yLabel) {
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