/**
 * Parking moudule for requesting and parsing data from the data.lacity.org
 */
var parkingModule = (function() {
	// Private scoped variables
	var googleKey = "AIzaSyDW9TVDX6032Uh4nX3g3muHFf1btG5aFnU";
	var url = "https://data.lacity.org/resource/t7gx-yi47.json";
	var limit = 300;
	var where = ["latitude > 100000"];
	var selectors = ["issue_time", "issue_date","latitude", "longitude", "location", "fine_amount"];
	var orderBy = ["issue_date DESC"];

	// module data
	var data = [];
	var cleanedData = [];
	var geoJson = {
		type: 'FeatureCollection',
		features: []
	};
	var currentQuery = "";

	// stack to hold previous queries
	var previousQueries = [];

	// parses the query url
	var parseQuery = function() {
		currentQuery = "";
		currentQuery = url + '?$limit=' + limit + '&$order=' + orderBy + '&$select=';
		currentQuery += selectors.join(',');
		currentQuery += '&$where=' + where.join(',');

		return currentQuery;
	}

	/**
	 * Gathers data from the data.lacity.org parking ticket api and
	 * cleans the data for use
	 * @return {[Objects]} array of cleaned data
	 */
	var fetchData = function() {
		return new Promise(function(resolve, reject) {
			// gets newest api url
			parseQuery();
			previousQueries.push(currentQuery);

			// gets parking ticket data
			fetch(currentQuery).then(function(response) {
				return response.json();
			}).then(function(json) {
				//stores unsanitized data
				data = json;
				return true;
			}).then(function(done) {
				//creates an array of promises to be fufilled
				var promises = [];
				for(var i = 0; i < data.length; i++) {
					// gathers the location data for each data point to fix lat and long
					promises.push(getLocation(data[i].location));
				}

				// after all promises are fufilled
				return Promise.all(promises);
			}).then(function(info) {
				//checks to make sure that all addresses were found
				if(info.length !== data.length) {
					throw new Error('There was a problem with fetching Locations.');
				}

				// cleans all the latitudes and longitudes
				for(var i = 0; i < data.length; i++) {
					data[i].latitude = info[i].results[0].geometry.location.lat;
					data[i].longitude = info[i].results[0].geometry.location.lng;
				}

				//returns the cleaned data
				cleanedData = data;
				return resolve(cleanedData);
			}).catch(function(err) {
				return reject(err);
			});
		});
	}

	/**
	 * Gets the location from the google maps api
	 * @param  {String} address adress that we are getting data for
	 * @return {Promise}         returns a promise that contains the api json
	 */
	var getLocation = function(address) {
		//parses url
		var locationUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address  + "&key=" + googleKey;

		var promise = new Promise(function(resolve, reject) {
			fetch(locationUrl).then(function(response) {
				return resolve(response.json());
			}).catch(function(err) {
				return reject(err);
			});
		});

		return promise;
	}

	/**
	 * Takes the cleaned data and creates a geoJSON compatible object
	 * @return {geoJson} returns a proper geoJSON object
	 */
	var createGeoJson = function() {
		if(cleanedData.length === 0) {
			throw new Error('Data must be fetched first');
		}

		for(var i = 0; i < cleanedData.length; i++) {
			var feature = {
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: []
				}
			};

			feature.geometry.coordinates.push(cleanedData[i].longitude);
			feature.geometry.coordinates.push(cleanedData[i].latitude);

			feature.properties = cleanedData[i];

			geoJson.features.push(feature);
		}

		return geoJson;
	}


	//returns cleaned data
	var getData = function() {
		return cleanedData;
	}

	//sets the where clause for the query
	var setWhere = function(w) {
		where = w;
		return where;
	}

	/**
	 * Sets the limit for the query
	 * @param {Int} l the number of rows to be queried
	 */
	var setLimit = function(l) {
		if(l < 0) {
			throw new Error('Limit must be greater than 0.');
		}

		limit = l;

		return limit;
	}

	/**
	 * Sets the columns to be selected for the query
	 * Selectors must include issue_time
	 * @param {[String]} s array of columns to be selected
	 */
	var setSelectors = function(s) {
		if(s.length === 0 || s.indexOf('issue_time') === -1) {
			throw new Error('issue_time is a required selector');
		}

		selectors = s;

		return selectors;
	}

	/**
	 * Set the order by of the requesting
	 * @param {String} o what the query is to be ordered by
	 */
	var setOrderBy = function(o) {
		orderBy = o;

		return orderBy;
	}

	/**
	 * Returns a JSON string to be printed to html
	 * @return {String} JSON string of the data
	 */
	var dataToString = function() {
		var data = {
			data: cleanedData
		};

		return JSON.stringify(data, null, 2);
	}

	/**
	 * Returns the geoJSON as a string for printing to html
	 * @return {String} geoJSON string of the geoJSON
	 */
	var geoJsonToString = function() {
		return JSON.stringify(geoJson, null, 2);
	}

	/**
	 * Returns the geoJson
	 * @return {Object} geoJson
	 */
	var getGeoJson = function() {
		return geoJson;
	}

	// exposes the public functions as an object
	return {
		createGeoJson: createGeoJson,
		getGeoJson: getGeoJson,
		geoJsonToString: geoJsonToString,
		dataToString: dataToString,
		fetchData: fetchData,
		getData: getData,
		parseQuery: parseQuery,
		setLimit: setLimit,
		setSelectors: setSelectors,
		setOrderBy: setOrderBy,
		setWhere: setWhere
	};
})();



function init() {
	parkingModule.fetchData().then(function() {
		parkingModule.createGeoJson();
		initMap(parkingModule.getGeoJson());
	});
}

/**
 * Creates and adds the map to the browser
 * @param  {object} geoJson points to be added to map
 */
function initMap(geoJson) {
	// create the map
	mapboxgl.accessToken = 'pk.eyJ1IjoiY29keWxleWhhbiIsImEiOiJjaXVldHZsYmswMGVlMm9sM2ZrN3BoeWpwIn0.1XUE4GT-FZ5fatKFdKt4OQ';

	var bounds = [
		[-118.68530273437501, 33.60546961227188], // southwest corner
		[-117.26257324218749, 34.347971491244955] // northeast corner
	];

	var map = new mapboxgl.Map({
			name: 'Visualizing LA',
			container: 'map',
			style: 'mapbox://styles/codyleyhan/ciunly98n008y2iqoawox0gjp',
			maxBounds: bounds
	});

	// add the geoJson data
	map.on('load', function() {
		map.addSource('tickets', {
			type: 'geojson',
			data: geoJson
		});

		// add the points to the map
		map.addLayer({
        "id": "points",
        "type": "circle",
        "source": "tickets",
				"paint" : {
					"circle-color" : 'rgba(255,0,0, 0.5)',
					"circle-radius" : 10,
					"circle-blur" : 1
				}
    });
	});

	// if click on a point
	map.on('click', function (e) {
		// search for the point clicked
		var features = map.queryRenderedFeatures(e.point, { layers: ['points']});

		// if the click is not on a point
		if(!features.length) {
			return;
		}


		var feature = features[0];
		var time = parseTime(feature);

		// create pop up html
		var html = '<strong>Information</strong><p>This fine occured on ' + feature.properties.location + ' at '
				+ time + ' and cost $' + feature.properties.fine_amount + '.00.</p>'

		// add the popup to the map
		var popup = new mapboxgl.Popup()
				.setLngLat(feature.geometry.coordinates)
				.setHTML(html)
				.addTo(map);
	});

	// adjust cursor for when over a point
	map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['points'] });
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
	});
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
