var expect = require('chai').expect;
var download = require('../download')
var index = require('../index');
var _ = require('lodash');

describe('all', function() {

  // before(function() {
  //   this.timeout(30000)
  //   return download()
  // })

  it('should lookup an IATA code', function() {
    var row = index.lookupByIataCode('EWR')
    expect(row.iata).to.equal('EWR');
    expect(row.city).to.equal('Newark');
    expect(row.name).to.equal('Newark Liberty Intl (EWR)');
  })

  it('should search up an airport by name', function() {
    var rows = index.searchByAirportName('newark')
    expect(_.pluck(rows, "iata")).to.contain("EWR")
  })

})
