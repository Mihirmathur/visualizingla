var vehiclesModule = (function() {
  
  //----- Public API -----//
  
  var getData = function() {
    return data;
  }
  
  // Returns array of all data
  var fetchData = function() {
    return new Promise(function(resolve, reject) {
      $.getJSON(api, function(d) {
        data = d;
        removeTimeFromDate();
        joinLevels();
        resolve(data);
      }).fail(function(jqxhr, textStatus, error) {
        console.log("Request Failed: " + err);
        reject('Error!');
      });
    });
  }

  // Returns object of the form
  // { entry: XXXXX, exit: XXXXX }
  var vehiclesForMonth = function(month) {
    var output = {};
    for (var i of data) {
      if (i.reportingmonth === month) {
        output[i.entryexit.toLowerCase()] = i.total_vehicles; 
      }
    }
    return output;
  }
  
  //----- Private API -----//  

  var api = "https://data.lacity.org/resource/x7vu-vht3.json";
  var data = [];
  
  var removeTimeFromDate = function() {
    var newArr = [];
    for (var i of data) {
      i.reportingmonth = i.reportingmonth.substring(0, 7);
      newArr.push(i);
    }
    return newArr;
  }

  var joinLevels = function() {
    var newArr = [];

    for (var i = 0; i < data.length; i++) {

      // Check if the array contains an object with this date/ee
      var index = newArr.findIndex(function(el) {
        // If the newArray contains the same header data as the current element
        return (el.reportingmonth === data[i].reportingmonth &&
          el.entryexit === data[i].entryexit);
      });

      // If the current date/entryexit is logged
      if (index !== -1) {
        // update the count
        newArr[index].total_vehicles += Number(data[i].total_vehicles);
      } else { // Otherwise, create the object and its data
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
    fetchData: fetchData,
    getData: getData,
    vehiclesForMonth: vehiclesForMonth
  }
  
})();

vehiclesModule.fetchData().then(function(d) {
  console.log(vehiclesModule.vehiclesForMonth("2014-06"));
});