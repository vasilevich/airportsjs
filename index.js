var airports = require('./airports')
var _ = require('lodash');

airports = _.indexBy(airports, function(a) {
  return a.iata;
});

module.exports.lookupByIataCode = function(iataCode) {
  return airports[iataCode]
}

module.exports.searchByAirportName = function(name) {
  return _.chain(airports)
    .filter(function(v) {
      return v.name.toLowerCase().indexOf(name.toLowerCase()) > -1
    })
    .value()
}
