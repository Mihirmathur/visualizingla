/*
 * Module to request and process data about passenger traffic by terminal.
 *  (from data.lacity.org)
 */

var terminalModule = (function() {
  // Limit default 1000, add '?$limit=5000' to get this whole dataset
  var url = 'https://data.lacity.org/resource/g3qu-7q2u.json?$limit=10';
  var json = {};
  
  /*
   * Retrieve termimnal passenger count data from data.lacity.org api
   */
  var fetchData = function () {
    return new Promise(function(resolve, reject) {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          json = data;
          resolve(json);
        })
        .catch(err => reject(err));
    });
  }

  /*
   * Format it nicely
   */
  var printData = function () {
    prettyJson = ""
    for (let obj in json) {
      prettyJson += '{\n';
      for (let prop in json[obj]) {
        prettyJson += '     ' + prop + ': ' + json[obj][prop] + '\n';
      }
      prettyJson += '}\n';
    }
    return prettyJson;
  }

  return {
    fetchData: fetchData,
    printData: printData,
  }
})();

terminalModule.fetchData().then(() => {
  document.getElementById('json').innerHTML = terminalModule.printData(); 
});
