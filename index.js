var airports = require('./airports')
var _ = require('lodash');
var Autocomplete = require('triecomplete');

var airportIataAutocomplete = new Autocomplete();
airportIataAutocomplete.initialize(_.map(airports, function(a) {
  return [a.iata.toLowerCase(), a];
}));

airports = _.keyBy(airports, function(a) {
  return a.iata;
});

module.exports.lookupByIataCode = function(iataCode) {
  return airports[iataCode]
}

module.exports.searchByAirportName = function(name) {
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
    .filter(function(v) {
      return !_.includes(iatas, v.iata) && v.name.toLowerCase().indexOf(name) > -1
    })
    .value()

  // have airports with matching iatas be listed before airports with names that
  // have a matching substring
  return iataResults.concat(nameResults);
}