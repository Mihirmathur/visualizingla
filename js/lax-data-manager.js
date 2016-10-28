var DataManager = (function() {

	var flightData, vehicleData;

	function getAllData() {
		var obj = {};
		obj.flightData = flightData;
		obj.vehicleData = vehicleData;
		return obj;
	}

	function flightData() {
		return flightData;
	}

	function vehicleData() {
		return vehicleData;
	}

	function downloadData() {
		return new Promise(function(resolve, reject) {

			flightsModule.fetchData().then(function() {
				flightData = flightsModule.allCounts();
			}).then(function() {			
				vehiclesModule.fetchData().then(function() {
					vehicleData = vehiclesModule.allCounts();
					resolve('Success!');
				});
			});
		});
	}

	// Return object with data on flights and vehicles in/out for a given month
	function dataForMonth(month) {
		var obj = {};

		// TODO: Make it return without date as key!!!!
		obj.flights = flightData.find(function(el) {
			return Object.keys(el)[0] === month;
		});
		obj.vehicles = vehicleData.find(function(el) {
			return Object.keys(el)[0] === month;
		})
		return obj;
	}

	return {
		downloadData: downloadData,
		getAllData: getAllData,
		dataForMonth: dataForMonth,
		vehicleData: vehicleData,
		flightData: flightData 
	}

})();

DataManager.downloadData().then(function() {

	var flightDates = new Set;
	for (var i of DataManager.flightData()) {
		flightDates.add(Object.keys(i)[0]);
	}

	var vehicleDates = new Set;
	for (var i of DataManager.vehicleData()) {
		vehicleDates.add(Object.keys(i)[0]);
	}

	var availableDatesSet = new Set([...flightDates].filter(x => vehicleDates.has(x)))
	var bGdates = Array.from(availableDatesSet);
	var bGflights = [];

	for (var date of bGdates) {
		var data = DataManager.dataForMonth(date);
		// console.log(data);
		bGflights.push(data.flights[date]);
	}

	console.log(bGflights);

	// Create horizontal bar graph on 
	// div element with "chart" class
	d3.select(".chart")
	.selectAll("div")
	.data(bGflights)
	.enter().append("div")
	.style("width", function(d) { return d * 0.01 + "px"; })
	.style("height", "20px")
	.style("border", "1px solid black")
	.text(function(d) { return d; });

});
