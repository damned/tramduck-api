const fs = require('fs');

let stationsJson = fs.readFileSync('tramchester-stations.json');
let rawStations = JSON.parse(stationsJson);

function stripPossessiveS(s) {
  return s.replace(/'s/g, 's');
}
function replaceAnds(s) {
  return s.replace(/&/g, 'and');
}
function replaceNonAlpabetic(s) {
  return s.replace(/[^a-zA-Z]/g, '-');
}
function lowerCase(s) {
  return s.toLowerCase();
}
function suffixWithTram(s) {
  return s + '-tram';
}
let station_ids = rawStations.map(station => {
  return station.name;
}).map(stripPossessiveS).map(replaceAnds).map(replaceNonAlpabetic).map(lowerCase);

let stations = station_ids.map(station => {
  return {
    id: station,
    tfgm_id: suffixWithTram(station)
  }
});

console.log(stations);
