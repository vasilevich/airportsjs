var airlines = require('airline-codes/airlines.json')
  .filter(({iata}) => (iata && iata.replace(/[^a-z0-9]/ig,'').length > 0))
  .filter(({icao}) => (icao && icao.replace(/[^a-z0-9]/ig,'').length > 0))
  .map(({id, alias, callsign, ...rest}) => (rest));
var _ = require('lodash');
var Autocomplete = require('triecomplete');

var airlineIcaoAutocomplete = new Autocomplete();
airlineIcaoAutocomplete.initialize(_.map(airlines, function (a) {
  return [a.icao.toLowerCase(), a];
}));

airlines = _.keyBy(airlines, function (a) {
  return a.icao;
});

module.exports.lookupByicaoCode = function (icaoCode) {
  return airlines[icaoCode]
}

module.exports.searchByAirlineName = function (name) {
  if (_.isEmpty(name)) {
    return [];
  }

  name = name.toLowerCase();

  var icaoResults = [];
  var nameResults = [];

  if (name.length <= 3) {
    // searches airline by icao, using name as prefix
    icaoResults = _.chain(airlineIcaoAutocomplete.search(name))
      .map('value')
      .sortBy('icao')
      .value();
  }

  var icaos = _.map(icaoResults, 'icao');

  nameResults = _.chain(airlines)
    .filter(function (v) {
      return !_.includes(icaos, v.icao) && v.name.toLowerCase().indexOf(name) > -1
    })
    .value()

  // have airlines with matching icaos be listed before airlines with names that
  // have a matching substring
  return icaoResults.concat(nameResults);
}

module.exports.searchByAll = function (name) {
  if (_.isEmpty(name)) {
    return [];
  }

  name = name.toLowerCase().trim();
  var nameWithNoSpecialChars = removeSpecialChars(name);
  var icaoResults = [];
  var nameResults = [];

  if (name.length <= 3) {
    // searches airline by icao, using name as prefix
    icaoResults = _.chain(airlineIcaoAutocomplete.search(name))
      .map('value')
      .sortBy('icao')
      .value();
  }

  var icaos = _.map(icaoResults, 'icao');

  function removeSpecialChars(str) {
    return str.replace(/-/g, " ").replace(/_/g, " ").replace(/[^\w\s]/gi, '');
  }

  var keysToCheck = [
    'name',
    'city',
    'country',
    'icao',
  ];

  nameResults = _.chain(airlines)
    .map(function (airline) {
      var hits = 0;
      for (var i in keysToCheck) {
        var airlineValue = airline[keysToCheck[i]];
        if (airlineValue) {
          airlineValue = airlineValue.toLowerCase().trim();
          var airlineValueNoSpecialChars = removeSpecialChars(airlineValue);
          if (airlineValue === name) {
            hits += 1000;
          } else if (airlineValueNoSpecialChars === nameWithNoSpecialChars) {
            hits += 800;
          } else if (_.startsWith(airlineValueNoSpecialChars, nameWithNoSpecialChars)
          ) {
            hits += 750;
          } else if (_.startsWith(nameWithNoSpecialChars, airlineValueNoSpecialChars)
          ) {
            hits += 600;
          } else if (_.endsWith(nameWithNoSpecialChars, airlineValueNoSpecialChars)
          ) {
            hits += 500;
          } else if (_.endsWith(airlineValueNoSpecialChars, nameWithNoSpecialChars)
          ) {
            hits += 500;
          } else if (_.includes(nameWithNoSpecialChars, airlineValueNoSpecialChars)
          ) {
            hits += 300;
          } else if (_.includes(nameWithNoSpecialChars, airlineValueNoSpecialChars)) {
            hits += 250;
          }
        }
      }
      airline.hits = hits;
      return airline;
    })
    .filter(function (airline) {
      return airline.hits > 0;
    })
    .sort(function (airline1, airline2) {
      return airline2.hits - airline1.hits;
    })
    .value();
	//make sure the array has only unique objects
  var array = icaoResults.concat(nameResults);
  var flags = [], output = [], l = array.length, i;
  for (i = 0; i < l; i++) {
     if (flags[array[i].name]) continue;
     flags[array[i].name] = true;
     output.push(array[i]);
  }
  
  // have airlines with matching icaos be listed before airlines with names that
  // have a matching substring
  return output;
}

module.exports.removeEachItemFromList = function (criteria) {
  if (typeof criteria === 'function') {
    for (var airlineKey in airlines) {
      if (criteria(airlines[airlineKey])) {
        delete airlines[airlineKey];
      }
    }
  }
};
