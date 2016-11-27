
/**
 * If called on a string capitalizes the first letter of each word.
 */
String.prototype.capitalize = function(){
	return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
};


/**
 * Function that runs as soon as the page loads
 */
function init() {
	// create the map
	var map = initMap(parkingModule.getPoints());

	// hide map controls
	$(".leaflet-control-zoom").css("visibility", "hidden");
	$(".info-panel").css('visibility', 'hidden');
	$(".fixed-over-mobile").css('visibility', 'hidden');

	// watch btn click
	$('.btn-close').click(function() {
		initModule.closePopup();
	});
}


/**
 * Module that controls the inital info screen that covers the map
 */
var initModule = (function() {
	// cache the element
	var el = $('#map-init');

	/**
	 * When the close button is pressed
	 */
	var closePopup = function() {
		el.each(function(i) {
			// the init screen slides out to the right
			$(this).animate({
				"left": "100%"
			}, {
				"complete" : function() {
					// remove the init screen
					el.remove();
					// show map controls
					$(".leaflet-control-zoom").css("visibility", "");
					$(".info-panel").css('visibility', '');
					$(".fixed-over-mobile").css('visibility', '');
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

	// constructor
	var init = function() {
		// store the json
		data = parkingData;

		// push data to just points with the last element being all the data
		for(var i = 0; i < data.length; i++) {
			points.push([data[i].longitude, data[i].latitude, data[i]]);
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


/**
 * Creates and adds the map to the browser
 * @param  {object} geoJson points to be added to map
 */
function initMap(points) {

	L.mapbox.accessToken = "pk.eyJ1IjoiY29keWxleWhhbiIsImEiOiJjaXVldHZsYmswMGVlMm9sM2ZrN3BoeWpwIn0.1XUE4GT-FZ5fatKFdKt4OQ";
	var bounds = L.latLngBounds([33.2,-119.37369384765625], [34.643594729697406,-116.9769287109375]);

	// create the map
	var map = L.mapbox.map('map', 'mapbox.dark',{
		center: L.latLng(34.052234, -118.243685),
		minZoom: 11,
		maxBounds: bounds
	});

	// set the map limits
	map.fitBounds(bounds);


	// load map tiles
	L.mapbox.styleLayer('mapbox://styles/codyleyhan/ciukqoz0100682iqo5r90dmnf').addTo(map);

	// create the ticket density window
	var info = L.control();

	info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info-panel'); // create a div with a class "info"
    this.update();
    return this._div;
	};


	// function to update the ticket density window
	info.update = function (props) {
    this._div.innerHTML = '<h4>Parking Ticket Density</h4>' +   (props ?
			 props.density + ' tickets / hexagon <br /> Average fine amount is $' +
			 props.average + '<br /><hr /><span class="info-desk">' + props.ticket  + '</span>': 'Hover over a hexagon <br /> To see more stats')
			 + '</span><span class="info-mobile">View on desktop for more info on tickets.</span>';
	};

	info.addTo(map);

	// hexbin options
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
		data: function(d) {
			return d[2];
		},
    value: function(d){
        return d.length;
    },
    valueFloor: 0,
    valueCeil: undefined,
		onclick: function(d, node, layer) {
			// ensure that click event only works on mobile

			if(node.getAttribute('fill') != '#f8c81c') {
				this.onmouseover(d, node, layer);
			}
		},
		onmouseout: function(d, node, layer) {
			// change the color back to its original color
			node.setAttribute('fill', layer.options.lastColor);
			info.update();
		},
		onmouseover: function(d, node, layer) {
			// find the fine average for a hexagon
			var fineTotal = 0;

			for(var i = 0; i < d.length; i++) {
				fineTotal += d[i].data.fine_amount;
			}

			var fineAverage = (fineTotal / (1.0 * d.length)).toFixed(2);

			// choose a random ticket from hexagon to show more info
			var randomNum = Math.floor(Math.random() * (d.length));
			var ranTicket = d[randomNum].data;

			// parse the random ticket time
			var time = parseTime(d[randomNum].data);

			// generate the html
			var ticketString = "One of the tickets happened at <br /> " + ranTicket.location.toLowerCase().capitalize() + " at " +
									 time + "<br /> because of violating \"" + ranTicket.violation.toString().toLowerCase()  +
									 "\"<br /> and the fine was $" + ranTicket.fine_amount;


			//update ticket density window
			info.update({
				density: d.length,
				average: fineAverage,
				ticket: ticketString
			});

			// cache the current hexagon color
			layer.options.lastColor = node.getAttribute('fill');

			// change the hexagon to a new color
			node.setAttribute('fill', '#f8c81c');
		},
		lastColor: null
	};

	// generate the hexbin heat map
	var hexLayer = L.hexbinLayer(options).addTo(map)
	hexLayer.colorScale().range(['#ffffff', '#D0021B']);
	hexLayer.data(points);

	return map;
}


/**
 * Parses ticket time into a usable format
 * @param  {object} feature the feature that has the time data
 * @return {string}         the parsed time string
 */
function parseTime(data) {
	var time = "";
	var designation = "AM"
	var normTime = data.issue_time.toString();

	// check if pm
	if(data.issue_time >= 1200) {
		// normalize th be time and update designation
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
	if(data.issue_date) {
		time += ' on ' + data.issue_date;
	}

	return time;
}

init();
