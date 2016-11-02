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
        //        d3.select("#flights-chart").selectAll("div").data(flightsArray()).enter().append("div").style("width", function () {
        //            return (maxWidth / dates.length);
        //        }).style("height", function (d) {
        //            var factor = stats.flights.max / maxHeight;
        //            return ((d / factor) + "px");
        //        }).html(function (d) {
        //            return "<p>" + d + "</p>";
        //        })
        //        
        var width = 420
        var barHeight = 20;
        var x = d3.scaleLinear().domain([0, d3.max(data)]).range([0, width]);
        // Set SVG's size attributes based on dataset size
        var chart = d3.select(selector).attr("width", width).attr("height", barHeight * data.length);
        // Create "g" elements for every data point
        var bar = chart.selectAll("g").data(data).enter().append("g").attr("transform", function (d, i) {
            return "translate(0," + i * barHeight + ")";
        });
        bar.append("rect").attr("width", x).attr("height", barHeight - 1);
        bar.append("text").attr("x", function (d) {
            return x(d) - 3;
        }).attr("y", barHeight / 2).attr("dy", ".35em").text(function (d) {
            return d;
        });
    }

//    function plotVehiclesInData() {
//        d3.select("#vehicles-in-chart").selectAll("div").data(vehiclesInArray()).enter().append("div").style("width", function () {
//            return (maxWidth / dates.length);
//        }).style("height", function (d) {
//            var factor = stats.vehiclesIn.max / maxHeight;
//            return ((d / factor) + "px");
//        }).html(function (d) {
//            return "<p>" + d + "</p>";
//        })
//    }
//
//    function plotVehiclesOutData() {
//        d3.select("#vehicles-out-chart").selectAll("div").data(vehiclesOutArray()).enter().append("div").style("width", function () {
//            return (maxWidth / dates.length);
//        }).style("height", function (d) {
//            var factor = stats.vehiclesIn.max / maxHeight;
//            return ((d / factor) + "px");
//        }).html(function (d) {
//            return "<p>" + d + "</p>";
//        })
//    }

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
        , processData: processData
        , plot: plot
    }
})();
DataManager.downloadData().then(function () {
    DataManager.plot(DataManager.flights(), "#flights-chart");
    DataManager.plot(DataManager.vehiclesIn(), "#vehicles-in-chart");
    DataManager.plot(DataManager.vehiclesOut(), "#vehicles-out-chart");
});