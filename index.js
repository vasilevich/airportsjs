var airports = require('airline-codes/airlines.json')
  .filter(({iata}) => (iata && iata.replace(/[^a-z0-9]/ig,'').length > 0))
  .map(({id, alias, callsign, ...rest}) => (rest));
var _ = require('lodash');
var Autocomplete = require('triecomplete');

var airportIataAutocomplete = new Autocomplete();
airportIataAutocomplete.initialize(_.map(airports, function (a) {
  return [a.iata.toLowerCase(), a];
}));

airports = _.keyBy(airports, function (a) {
  return a.iata;
});

module.exports.lookupByIataCode = function (iataCode) {
  return airports[iataCode]
}

module.exports.searchByAirportName = function (name) {
  if (_.isEmpty(name)) {
    return [];
  }

  name = name.toLowerCase();

  var iataResults = [];
  var nameResults = [];

  if (name.length <= 3) {
    // searches airport by iata, using name as prefix
    iataResults = _.chain(airportIataAutocomplete.search(name))
      .map('value')
      .sortBy('iata')
      .value();
  }

  var iatas = _.map(iataResults, 'iata');

  nameResults = _.chain(airports)
    .filter(function (v) {
      return !_.includes(iatas, v.iata) && v.name.toLowerCase().indexOf(name) > -1
    })
    .value()

  // have airports with matching iatas be listed before airports with names that
  // have a matching substring
  return iataResults.concat(nameResults);
}

module.exports.searchByAll = function (name) {
  if (_.isEmpty(name)) {
    return [];
  }

  name = name.toLowerCase().trim();
  var nameWithNoSpecialChars = removeSpecialChars(name);
  var iataResults = [];
  var nameResults = [];

  if (name.length <= 3) {
    // searches airport by iata, using name as prefix
    iataResults = _.chain(airportIataAutocomplete.search(name))
      .map('value')
      .sortBy('iata')
      .value();
  }

  var iatas = _.map(iataResults, 'iata');

  function removeSpecialChars(str) {
    return str.replace(/-/g, " ").replace(/_/g, " ").replace(/[^\w\s]/gi, '');
  }

  var keysToCheck = [
    'name',
    'city',
    'country',
    'iata',
  ];

  nameResults = _.chain(airports)
    .map(function (airport) {
      var hits = 0;
      for (var i in keysToCheck) {
        var airportValue = airport[keysToCheck[i]];
        if (airportValue) {
          airportValue = airportValue.toLowerCase().trim();
          var airportValueNoSpecialChars = removeSpecialChars(airportValue);
          if (airportValue === name) {
            hits += 1000;
          } else if (airportValueNoSpecialChars === nameWithNoSpecialChars) {
            hits += 800;
          } else if (_.startsWith(airportValueNoSpecialChars, nameWithNoSpecialChars)
          ) {
            hits += 750;
          } else if (_.startsWith(nameWithNoSpecialChars, airportValueNoSpecialChars)
          ) {
            hits += 600;
          } else if (_.endsWith(nameWithNoSpecialChars, airportValueNoSpecialChars)
          ) {
            hits += 500;
          } else if (_.endsWith(airportValueNoSpecialChars, nameWithNoSpecialChars)
          ) {
            hits += 500;
          } else if (_.includes(nameWithNoSpecialChars, airportValueNoSpecialChars)
          ) {
            hits += 300;
          } else if (_.includes(nameWithNoSpecialChars, airportValueNoSpecialChars)) {
            hits += 250;
          }
        }
      }
      airport.hits = hits;
      return airport;
    })
    .filter(function (airport) {
      return airport.hits > 0;
    })
    .sort(function (airport1, airport2) {
      return airport2.hits - airport1.hits;
    })
    .value();
	//make sure the array has only unique objects
  var array = iataResults.concat(nameResults);
  var flags = [], output = [], l = array.length, i;
  for (i = 0; i < l; i++) {
     if (flags[array[i].name]) continue;
     flags[array[i].name] = true;
     output.push(array[i]);
  }
  
  // have airports with matching iatas be listed before airports with names that
  // have a matching substring
  return output;
}
