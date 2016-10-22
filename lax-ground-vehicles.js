var api = "https://data.lacity.org/resource/x7vu-vht3.json";

$(document).ready(function() {
  $.getJSON(api, function(data) {
    console.log(data);
    data = joinLevels(data);
    console.log(data);
  });
});

var joinLevels = function(arr) {
  
  var newArr = [];
  
  for (var i = 0; i < arr.length; i++) {
    
    // Check if the array contains an object with this date/ee
    var index = newArr.findIndex(function(el) {
      // If the newArray contains the same header data as the current element
      return (el.reportingmonth === arr[i].reportingmonth && 
              el.entryexit === arr[i].entryexit);  
    })
    
    // If the current date/entryexit is logged
    if (index !== -1) {
      // update the count
      newArr[index].total_vehicles += Number(arr[i].total_vehicles);
    } else {  // Otherwise, create the object and its data
      var newObj = {}
      newObj.reportingmonth = arr[i].reportingmonth;
      newObj.entryexit = arr[i].entryexit;
      newObj.total_vehicles = Number(arr[i].total_vehicles);
      newArr.push(newObj);
    }
  }
  
  return newArr;
}