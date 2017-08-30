'use strict';

const cheerio = require('cheerio');
const reqlib = require('request');


function Tram($tram) {
  function parse_destination() {
    return $tram.find('.departure-destination').text();
  }
  return {
    get destination() { return parse_destination(); }
  }
}

exports.trams = (request, response) => {
  let tram_stop_id = 'piccadilly-gardens-tram';
  let url = 'https://beta.tfgm.com/public-transport/tram/stops/' + tram_stop_id;
  reqlib.get(url, (error, page_response, body) => {
    let $ = cheerio.load(body);
    
    let trams = $('#departure-items .tram').get().map(el => { return Tram($(el)); });

    response.status(200).send({ trams: trams });
  });  
};

exports.event = (event, callback) => {
  callback();
};
