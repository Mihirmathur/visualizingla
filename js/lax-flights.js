/*

Flight Operations by month

Data:
• reporting period
• flight type
• arrival or departure
• domestic or international
• flight operations

*/
var flightsModule = (function() {
  
  //----- Public API -----//
  
  var getData = function() {
    return data;
  }

  var fetchData = function() {

    // return a promise that the data has been accessed
    return new Promise(function(resolve, reject) {
      $.getJSON(api + "?" + $.param(parameters), function(d) {
        data = d;
        removeTimeFromDate();
        resolve('Success!');
      }).fail(function(jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        console.log("Request Failed: " + err);
        reject('Error!');
      });

    });
  }

  // Returns # of flights in a given month
  // Enter date in format: YYYY-MM
  function getFlightCountForMonth(month) {
    var count = 0;

    for (var i = 0; i < data.length; i++) {
      if (data[i].hasOwnProperty('reportperiod') && data[i].reportperiod.substr(0, 7) === month) {
        count += Number(data[i].flightopscount);
      }
    }

    return count;
  }

  // Returns an object with KV-pairs of the form
  // YYYY-MM: ######
  function getAllFlightCounts() {
    var dateSet = new Set();
    for (var i = 0; i < data.length; i++) {
      dateSet.add(data[i].reportperiod);
    }

    var dateCounts = {};
    // { YYYY-MM-DD: 0, ... }
    for (var item of dateSet) {
      dateCounts[item] = 0;
    }

    for (i = 0; i < arr.length; i++) {
      dateCounts[data[i].reportperiod] += Number(data[i].flightopscount);
    }

    return dateCounts;
  }
  
  //----- Private API -----//
  
  var api = "https://data.lacity.org/resource/3ndt-ics3.json";
  var parameters = {
    "$select": "reportperiod, flighttype, arrival_departure, domestic_international, flightopscount"
  };
  var data = [];
  
  // Clean up reportperiod key from:
  // YYYY-MM-DDT... to just YYYY-MM
  function removeTimeFromDate() {
    var newArr = [];
    for (var i of data) {
      i.reportperiod = i.reportperiod.substring(0, 7);
      newArr.push(i);
    }
    return newArr;
  }

  return {
    getData: getData,
    fetchData: fetchData,
    flightsForMonth: getFlightCountForMonth,
    allFlights: getAllFlightCounts
  };

})();

flightsModule.fetchData().then(function() {
  console.log(flight)
}).catch(function(reason) {
  console.log('Handle rejected promise (' + reason + ') here.');
});

// TODO: make fetchData use promises