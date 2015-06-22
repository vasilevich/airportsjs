var airports = require('./airports')
var Promise = require('bluebird');
var _ = require('lodash');

airports = _.indexBy(airports, function(a) {
  return a.iata;
});

module.exports.lookupByIataCode = function(iataCode, cb) {

  var q = Promise.resolve()
    .then(function() {
      return airports[iataCode]
    })

  if (cb) {
    q.nodeify(cb)
  } else {
    return q
  }

}

module.exports.searchByAirportName = function(name, cb) {

  name = name.toLowerCase()

  var q = Promise.resolve()
    .then(function() {
      return _.chain(airports)
        .filter(function(v) {
          return v.name.toLowerCase().indexOf(name) > -1
        })
        .value()
    })

  if (cb) {
    q.nodeify(cb)
  } else {
    return q
  }

}
