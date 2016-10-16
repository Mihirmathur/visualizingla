/**
 * Parking moudule for requesting and parsing data from the data.lacity.org
 */
var parkingModule = (function() {
	// Private scoped variables
	var url = "https://data.lacity.org/resource/t7gx-yi47.json";
	var limit = 100;
	var where = ["latitude > 100000"];
	var selectors = ["issue_time", "latitude", "longitude", "location", "fine_amount"];
	var orderBy = ["issue_date DESC"];

	// module data
	var data = {};
	var currentQuery = "";

	// stack to hold previous queries
	var previousQueries = [];

	// parses the query url
	var parseQuery = function() {
		currentQuery = url + '?$limit=' + limit + '&$order=' + orderBy + '&$select=';
		currentQuery += selectors.join(',');
		currentQuery += '&$where=' + where.join(',');

		return currentQuery;
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

	// exposes the public functions as an object
	return {
		parseQuery: parseQuery,
		setLimit: setLimit,
		setSelectors: setSelectors,
		setOrderBy: setOrderBy,
		setWhere: setWhere
	};
})();
