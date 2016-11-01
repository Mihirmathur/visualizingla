/**
 * Parking moudule for requesting and parsing data from the data.lacity.org
 */
var parkingModule = (function() {
	// Private scoped variables
	var googleKey = "AIzaSyDW9TVDX6032Uh4nX3g3muHFf1btG5aFnU";
	var url = "https://data.lacity.org/resource/t7gx-yi47.json";
	var limit = 100;
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


function initMap(geoJson) {
	mapboxgl.accessToken = 'pk.eyJ1IjoiY29keWxleWhhbiIsImEiOiJjaXVldHZsYmswMGVlMm9sM2ZrN3BoeWpwIn0.1XUE4GT-FZ5fatKFdKt4OQ';
	var map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/codyleyhan/ciunly98n008y2iqoawox0gjp'
	});

	console.log(geoJson);

	map.on('load', function() {
		map.addSource('tickets', {
			type: 'geojson',
			data: geoJson
		});

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
}


init();
