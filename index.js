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

exports.trams = (request, response) => {
  let tram_stop_id = 'piccadilly-gardens';
  let tfgm_stop_id = stations.find(station => { return station.id === tram_stop_id }).tfgm_id;
  // let tram_stop_id = 'stretford-tram';

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
