# airportsjs

A library to help you search and obtain airport codes.

## Install

```
npm install airpotsjs --save
```

## Usage

You can also use the following functions without a callback to get a Promisified version of it.

```
index.lookupByIataCode('EWR', cb)
```

```
{ name: 'Newark Liberty Intl',
  city: 'Newark',
  country: 'United States',
  iata: 'EWR',
  latitude: 40.6925,
  longitude: -74.168667 }
```

```
index.searchByAirportName('Newark')
```

```
[ { name: 'Newark Liberty Intl',
    city: 'Newark',
    country: 'United States',
    iata: 'EWR',
    latitude: 40.6925,
    longitude: -74.168667 },
  { name: 'Newark Penn Station',
    city: 'Newark',
    country: 'United States',
    iata: 'ZRP',
    latitude: 40.734722,
    longitude: -74.164167 } ]
```

## License
MIT.
