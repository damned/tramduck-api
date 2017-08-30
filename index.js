'use strict';

const cheerio = require('cheerio');
const reqlib = require('request');
const stations = require('./stations.json');

function Tram($tram) {
  function field(selector) {
    return $tram.find(selector).text().trim();
  }

  function parse_carriages() {
    let carriages = field('.departure-carriages');
    if (/.*ouble.*/.exec(carriages) != null) {
      return 2;
    }
    else {
      return 1;
    }
  }

  function parse_wait_minutes() {
    let wait = field('.departure-wait');
    let parsed_mins = /(\d+)mins?/.exec(wait);
    if (parsed_mins == null) {
      return 0;
    }
    return parseInt(parsed_mins[1]);
  }

  return {
    get destination() { return field('.departure-destination'); },
    get carriages() { return parse_carriages(); },
    get wait() { return {
        minutes: parse_wait_minutes()
      };
    }
  }
}

function lookupTfgmId(tram_stop_id) {
  try {
    return stations.find(station => { return station.id === tram_stop_id }).tfgm_id;
  }
  catch(err) {
    console.log('Unknown station id', err);
    return null;
  }
}

function valid_station_ids() {
  return stations.map(station => { return station.id; });
}

exports.trams = (request, response) => {
  let tram_stop_id = 'piccadilly-gardens';
  if (request.path !== null && request.path.length > 1) {
    tram_stop_id = request.path.slice(1);
  }
  console.log('path', request.path);
  let tfgm_stop_id = lookupTfgmId(tram_stop_id);

  if (tfgm_stop_id == null) {
    response.status(404).send({ error: 'Unknown station ID', valid_station_ids: valid_station_ids()})
    return;
  }

  let url = 'https://beta.tfgm.com/public-transport/tram/stops/' + tfgm_stop_id;
  reqlib.get(url, (error, page_response, body) => {
    let $ = cheerio.load(body);

    let trams = $('#departure-items .tram').get().map(el => { return Tram($(el)); });

    response.status(200).send({ stop: { tfgm_id: tfgm_stop_id }, trams: trams });
  });  
};

exports.event = (event, callback) => {
  callback();
};
