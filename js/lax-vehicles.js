/*

Example call

VehiclesModule.fetchData().then(function(r)) {
    var vehiclesArr = r;
}

vehiclesArr is of form
[ 
    { date/time: {entry: XXX, exit: XXX} }
    ...
]

Other calls you can make:

VehiclesModule.allCounts()
    - gets same array as totalFlights above
VehiclesModule.forMonth(month)
    - gets object of the form
      { entry: XXX, exit: XXX }

*/

var VehiclesModule = (function () {
    //----- Public API -----//
    function getData() {
        return data;
    }
    // Returns array of all data
    function fetchData() {
        return new Promise(function (resolve, reject) {
            $.getJSON(api, function (d) {
                data = d;
                //        removeTimeFromDate();
                removeRedundancies();
                joinLevels();
                resolve(getAllVehicleCounts());
            }).fail(function (jqxhr, textStatus, error) {
                console.log("Request Failed: " + err);
                reject('Error!');
            });
        });
    }
    // Returns object of the form
    // { entry: XXXXX, exit: XXXXX }
    function vehiclesForMonth(month) {
        var output = {};
        for (var i of data) {
            if (i.reportingmonth === month) {
                output[i.entryexit.toLowerCase()] = i.total_vehicles;
            }
        }
        return output;
    }

    function removeRedundancies() {
        var arr = [];
        for (var i of data) {
            if (arr.find(function (d) {
                    var a = (d.entryexit === i.entryexit);
                    var b = (d.reportingmonth === i.reportingmonth);
                    var c = (d.total_vehicles === i.total_vehicles);
                    var d = (d.upperlower === i.upperlower);
                    return (a && b && c && d);
                }) === undefined) {
                // If no duplicate was found, add it
                arr.push(i);
            }
        }
        data = arr;
    }
    // Returns array of objects of the form
    // { [date]: { entry: X, exit: Y }}
    function getAllVehicleCounts() {
        var m = data;
        var dateSet = new Set;
        for (var item of data) {
            dateSet.add(item.reportingmonth);
        }
        var counts = [];
        for (var date of dateSet) {
            var obj = {}
            obj[date] = vehiclesForMonth(date);
            counts.push(obj);
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
    var api = "https://data.lacity.org/resource/x7vu-vht3.json";
    var data = [];

    function joinLevels() {
        var newArr = [];
        for (var i = 0; i < data.length; i++) {
            // Check if the array contains an object with this date/ee
            var index = newArr.findIndex(function (el) {
                // If the newArray contains the same header data as the current element
                return (el.reportingmonth === data[i].reportingmonth && el.entryexit === data[i].entryexit);
            });
            // If the current date/entryexit is logged
            if (index !== -1) {
                // update the count
                newArr[index].total_vehicles += Number(data[i].total_vehicles);
            }
            else { // Otherwise, create the object and its data
                var newObj = {}
                newObj.reportingmonth = data[i].reportingmonth;
                newObj.entryexit = data[i].entryexit;
                newObj.total_vehicles = Number(data[i].total_vehicles);
                newArr.push(newObj);
            }
        }
        data = newArr;
    }
    return {
        fetchData: fetchData
        , forMonth: vehiclesForMonth
        , allCounts: getAllVehicleCounts
    }
})();