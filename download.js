var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var Converter = require('csvtojson').core.Converter;
var csvConverter = new Converter({constructResult: true})
var csvStringConverter = Promise.promisify(csvConverter.fromString, csvConverter)
var url = 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';
var _ = require('lodash');
var fs = require('fs');
var writeFileAsync = Promise.promisify(fs.writeFile, fs);

module.exports = function() {
  return request(url)
    .spread(function(response, body) {
      return body;
    })
    .then(function(data) {
      data = "id,name,city,country,iata,icao,latitude,longitude,altitude,timezone,dst,tz" + data
      return data
    })
    .then(csvStringConverter)
    .map(function(result) {
      return _.pick(result, "name", "city", "country", "iata", "latitude", "longitude")
    })
    .then(function(data) {
      return _.chain(data)
        .reject(function(r) {
          return _.isEmpty(r.iata)
        })
        .map(function(r) {
          r.name += " (" + r.iata + ")"
          return r
        })
        .sortBy(data, function(r) {
          return r.name
        })
        .value()
    })
    .then(function(data) {
      return writeFileAsync('airports.json', JSON.stringify(data))
    })
}

