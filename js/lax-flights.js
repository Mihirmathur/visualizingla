/*

Example call

FlightsModule.fetchData().then(function(r)) {
    var flightsArr = r;
}

flightsArr is of form
[ 
    { date/time: XXX }
    ...
]

Other methods:

FlightsModule.allCounts()
    - gets same array as totalVehicles above
FlightsModule.forMonth(month)
    - returns Number for flights in a given month

*/

var FlightsModule = (function () {
    //----- Public API -----//
    var getData = function () {
        return data;
    }
    var fetchData = function () {
            // return a promise that the data has been accessed
            return new Promise(function (resolve, reject) {
                var call = api + "?" + $.param(parameters);
                $.getJSON(call, function (d) {
                    data = d;
                    resolve(getAllFlightCounts());
                }).fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                    reject('Error!');
                });
            });
        }
    
    // Returns # of flights in a given month
    function getFlightCountForMonth(month) {
        var count = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].hasOwnProperty('reportperiod') && data[i].reportperiod === month) {
                count += Number(data[i].flightopscount);
            }
        }
        return count;
    }
    
    // Returns an object with KV-pairs of the form
    // YYYY-MM: ######
    function getAllFlightCounts() {
        var dateSet = new Set();
        var counts = []; // [ { YYYY-MM: 0 }, ... ]
        // Create unique set of dates (omit repeats)
        for (var i of data) {
            dateSet.add(i.reportperiod);
        }
        // Populate array with objects
        for (var date of dateSet) {
            // counts[item] = 0;
            var obj = {};
            obj[date] = 0;
            counts.push(obj);
        }
        // Sum up flights for a given month
        for (var item of data) {
            // if (data[i].reportperiod)
            for (var d of counts) {
                date = Object.keys(d)[0];
                if (item.reportperiod === date) {
                    d[date] += Number(item.flightopscount);
                }
            }
        }
        // Sort counts in chronological order
        counts.sort(function (a, b) {
            var keyA = Object.keys(a)[0];
            var keyB = Object.keys(b)[0];
            if (keyA < keyB) {
                return -1;
            }
            if (keyA > keyB) {
                return 1;
            }
            return 0;
        });
        return counts;
    }
    //----- Private API -----//
    var api = "https://data.lacity.org/resource/3ndt-ics3.json";
    var parameters = {
        "$select": "reportperiod, flighttype, arrival_departure, domestic_international, flightopscount",
        "$where": "reportperiod>'2013-01-01T00:00:00.000'"
    };
    var data = [];
    return {
        fetchData: fetchData
        , forMonth: getFlightCountForMonth
        , allCounts: getAllFlightCounts
    };
})();