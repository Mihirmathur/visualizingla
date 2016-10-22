/*

Flight Operations by month

Data:
• reporting period
• flight type
• arrival or departure
• domestic or international
• flight operations

*/

var api = "https://data.lacity.org/resource/3ndt-ics3.json";
var parameters = {
  "$select": "reportperiod, flighttype, arrival_departure, domestic_international, flightopscount"
};

// Get data
$.getJSON(api + "?" + $.param(parameters), function(data) {
  data = removeTimeFromDate(data);
  console.log(data);
  console.log(getAllFlightCounts(data));
  console.log(getFlightCountForMonth(data, "2006-07"));
});

// Clean up reportperiod key from:
// YYYY-MM-DDT... to just YYYY-MM
function removeTimeFromDate(arr) {
  var newArr = [];
  for (var i of arr) {
    i.reportperiod = i.reportperiod.substring(0, 7);
    newArr.push(i);
  }
  return newArr;
}

// Returns # of flights in a given month
// Enter date in format: YYYY-MM
function getFlightCountForMonth(arr, date) {
  var count = 0;

  for (var i = 0; i < arr.length; i++) {
    if (arr[i].hasOwnProperty('reportperiod') && arr[i].reportperiod.substr(0, 7) === date) {
      count += Number(arr[i].flightopscount);
    }
  }

  return count;
}

// Returns an object with KV-pairs of the form
// YYYY-MM: ######
function getAllFlightCounts(arr) {
  var dateSet = new Set();
  for (var i = 0; i < arr.length; i++) {
    dateSet.add(arr[i].reportperiod);
  }

  var dateCounts = {};
  // { YYYY-MM-DD: 0, ... }
  for (var item of dateSet) {
    dateCounts[item] = 0;
  }

  for (i = 0; i < arr.length; i++) {
    dateCounts[arr[i].reportperiod] += Number(arr[i].flightopscount);
  }

  return dateCounts;
}