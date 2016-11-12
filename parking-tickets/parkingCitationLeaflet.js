var initModule = (function() {
	var el = $('#map-init');

	var closePopup = function() {
		el.each(function(i) {
			//$(this).fadeOut(1000);
			$(this).animate({
				"left": "100%"
			}, {
				"complete" : function() {
					el.remove();
					$(".leaflet-control-zoom").css("visibility", "");
				}
			});
		});
	}


	return {
		closePopup: closePopup
	};
})();



/**
 * Parking moudule for requesting and parsing data from the data.lacity.org
 */
var parkingModule = (function() {


	// module data
	var data = [];
	var points = [];
	var geoJson = {
		type: 'FeatureCollection',
		features: []
	};

	var init = function() {
		data = parkingData;

		for(var i = 0; i < data.length; i++) {
			points.push([+(data[i].longitude.toFixed(2)), +(data[i].latitude.toFixed(2))]);
		}
	}

	init();

	var getPoints = function() {
		return points;
	}

	// exposes the public functions as an object
	return {
		getPoints: getPoints
	};
})();



function init() {
	var map = initMap(parkingModule.getPoints());

	$(".leaflet-control-zoom").css("visibility", "hidden");

	$('.btn-close').click(function() {

		initModule.closePopup();
	});
}

/**
 * Creates and adds the map to the browser
 * @param  {object} geoJson points to be added to map
 */
function initMap(points) {

	L.mapbox.accessToken = "pk.eyJ1IjoiY29keWxleWhhbiIsImEiOiJjaXVldHZsYmswMGVlMm9sM2ZrN3BoeWpwIn0.1XUE4GT-FZ5fatKFdKt4OQ";
	var bounds = L.latLngBounds([33.2,-119.37369384765625], [34.643594729697406,-116.9769287109375]);
	console.log(bounds);

	var map = L.mapbox.map('map', 'mapbox.dark',{
		maxBounds: bounds,
		center: L.latLng(34.052235, -118.2437)
	});

	map.fitBounds(bounds);

	L.mapbox.styleLayer('mapbox://styles/codyleyhan/ciukqoz0100682iqo5r90dmnf').addTo(map);

	// generate hexbins
	var options = {
    radius : 12,
    opacity: 0.5,
    duration: 500,
    lng: function(d){
        return d[0];
    },
    lat: function(d){
        return d[1];
    },
    value: function(d){
        return d.length;
    },
    valueFloor: 0,
    valueCeil: undefined
	};

	var hexLayer = L.hexbinLayer(options).addTo(map)
	hexLayer.colorScale().range(['white', 'red']);
	hexLayer.data(points);

	return map;
}


/**
 * Parses ticket time into a usable format
 * @param  {object} feature the feature in geoJson format
 * @return {string}         the parsed time string
 */
function parseTime(feature) {
	var time = "";
	var designation = "AM"
	var normTime = feature.properties.issue_time;

	// check if pm
	if(feature.properties.issue_time >= 1200) {
		// normalize the time and update designation
		if(normTime >= 1300) {
				normTime = normTime - 1200;
		}
		normTime = normTime.toString();
		designation = "PM";
	}

	// add semicolon and add the time
	time += normTime.substr(0, normTime.length - 2) + ':';
	time += normTime.substr(normTime.length - 2) + ' ' + designation;

	// if a date is avaliable then add the date to string
	if(feature.properties.issue_date) {
		var date = moment(feature.properties.issue_date).format('ddd MMMM Do');
		time += ' on ' + date;
	}

	return time;
}

init();
