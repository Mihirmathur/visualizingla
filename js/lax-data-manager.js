var DataManager = (function () {
    var maxHeight = 500; //px
    var maxWidth = 1000; //px
    var dates, flights, vehicles;
    // have data from 2013-05 to 2016-07
    // Stored in the form
    // { YYYY-MM: { flights: XXX, vehicles: { entry: XXX, exit: XXX } } }
    var data = {};
    // Stored in the form
    // { flights: {max, min, average, range}, vehiclesIn: ...}
    var stats = {};

    function dates() {
        return dates;
    }

    function flightsArray() {
        var flightArr = [];
        for (var date of dates) {
            flightArr.push(data[date].flights);
        }
        return flightArr;
    }

    function vehiclesInArray() {
        var vin = [];
        for (var date of dates) {
            vin.push(data[date].vehicles.entry);
        }
        return vin;
    }

    function vehiclesOutArray() {
        var vout = [];
        for (var date of dates) {
            vout.push(data[date].vehicles.exit);
        }
        return vout;
    }

    function plot(data, selector) {

        var margin = {top: 20, right: 20, bottom: 50, left: 100},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
        
        var max = d3.max(data);
        var min = d3.min(data);
        var range = max - min;
        
        // Set the ranges
        // TODO: Set domains as well (for x-axis)
        var x = d3.scaleTime().range([0, width]);
        var y = d3.scaleLinear()
            .domain([0, d3.max(data)])
            .range([height, 0]);
        
        // Set SVG's size
        var chart = d3.select(selector)
            .attr("width", width)
            .attr("height", height)
            .attr("cx", "30")
            .style("padding", "100px");
        
        var barWidth = width / data.length;
        
        // Create "g" elements for every data point
        var bar = chart.selectAll("g")
            .data(data).enter().append("g")
        
            // TODO: Understand how transform works
            .attr("transform", function (d, i) {
                return "translate(" + (i * barWidth) + ",0)";
            })
            .attr("fill", function(d) {
                // Fill with gradient color based on data value
                // TODO: Adapt to color style for our project
                return "rgb(0, 0, " + Math.floor((((d-min)/range) * 255))  + ")";
            });
        
        // Create rect elements for each bar
        bar.append("rect")
            // get relative height on our linear scale
            // and position it so the bottoms of the bars are flush
            .attr("y", function(d) { return y(d); })
            .attr("height", function(d) { return height - y(d); })
            .attr("width", barWidth - 1);
        
        // Add x-axis
        chart.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
//         x-axis labels
        chart.append("text")
            .attr("transform", 
                  "translate(" + (width/2) + "," + (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .style("fill", "#000")
            .style("font-size", "14px")
            .style("font-family", "Arial, sans-serif")
            .text("Date");
        
        // Add y-axis
        chart.append("g")
            .attr("transform", "translate(0, 5)")
            .call(d3.axisLeft(y));
//         y-axis labels
        chart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .attr("fill", "#000")
            .style("text-anchor", "middle")
            .text("Value");  
    
        // Text is probably not a good idea with such high values
        // unless we scale them down to "2.3m" for 2,300,000
        // Label the text in each rect
//        bar.append("text")
//            .attr("x", barWidth / 2)
//            .attr("y", function(d) { return y(d) + 3; })  
//            .attr("dy", ".75em")
//            .attr("transform", "rotate(90)")
//            .text(function (d) { return d; });
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

    function downloadData() {
        return new Promise(function (resolve, reject) {
            flightsModule.fetchData().then(function () {
                flights = flightsModule.allCounts();
            }).then(function () {
                vehiclesModule.fetchData().then(function () {
                    vehicles = vehiclesModule.allCounts();
                }).then(function () {
                    // Create array of concurrent dates
                    dates = intersectArrays(flights, vehicles);
                    for (var date of dates) {
                        data[date] = dataForMonth(date);
                    }
                    resolve("Success!");
                });
            });
        });
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
    
    return {
        downloadData: downloadData
        , data: data
        , dates: dates
        , flights: flightsArray
        , vehiclesIn: vehiclesInArray
        , vehiclesOut: vehiclesOutArray
        , plot: plot
    }
})();
DataManager.downloadData().then(function () {
    DataManager.plot(DataManager.flights(), "#flights-chart");
    DataManager.plot(DataManager.vehiclesIn(), "#vehicles-in-chart");
    DataManager.plot(DataManager.vehiclesOut(), "#vehicles-out-chart");
});