// Description:
//   Play radio on the Chromecast
//
// Commands
//   hubot radio <station_id> - Play a radio station on the Office Chromecast.
//   hubot radio stations - Display a list of available radio stations

const mqttPublish = require('../lib/mqtt');

const stations = [
  {
    id: 'bardufoss',
    name: 'Radio Bardufoss',
    url: 'http://stream.bardufoss.no/radiobardufoss192',
    contentType: 'audio/mp3'
  },
  {
    id: 'nrkp1',
    name: 'NRK P1',
    url: 'http://lyd.nrk.no/nrk_radio_p1_ostlandssendingen_mp3_h',
    contentType: 'audio/mp3'
  },
  {
    id: 'nrkp2',
    name: 'NRK P2',
    url: 'http://lyd.nrk.no/nrk_radio_p2_mp3_h',
    contentType: 'audio/mp3'
  },
  {
    id: 'nrkp3',
    name: 'NRK P3',
    url: 'http://lyd.nrk.no/nrk_radio_p3_mp3_h',
    contentType: 'audio/mp3'
  },
  {
    id: 'nrkp1p',
    name: 'NRK P1+',
    url: 'http://lyd.nrk.no/nrk_radio_p1pluss_mp3_h.m3u',
    contentType: 'audio/mp3'
  },
  {
    id: 'nrkp13',
    name: 'NRK P13',
    url: 'http://lyd.nrk.no/nrk_radio_p13_mp3_h',
    contentType: 'audio/mp3'
  },
  {
    id: 'nrkmp3',
    name: 'NRK mP3',
    url: 'http://lyd.nrk.no/nrk_radio_mp3_mp3_h',
    contentType: 'audio/mp3'
  },
  {
    id: 'nrksuper',
    name: 'NRK Super',
    url: 'http://lyd.nrk.no/nrk_radio_super_mp3_h',
    contentType: 'audio/mp3'
  },
  {
    id: 'nrkp3u',
    name: 'NRK P3 Urørt',
    url: 'http://lyd.nrk.no/nrk_radio_p3_urort_mp3_h',
    contentType: 'audio/mp3'
  },
  {
    id: 'thebeat',
    name: 'The Beat',
    url: 'http://stream.thebeat.no/beat64.mp3',
    contentType: 'audio/mp3'
  },
  {
    id: 'energi',
    name: 'Energi',
    url:
      'https://nrj.p4groupaudio.com/NRJ_MH?args=web_01&referrer=13&station=13&codec=mp3&quality=high&distributor=p4',
    contentType: 'audio/mp3'
  }
];

const isRadioStation = stationId =>
  stations.find(station => station.id == stationId) !== undefined;

function playRadioStation(station) {
  const payload = {
    command: 'media',
    url: station.url,
    content_type: station.contentType
  };

  return mqttPublish('office_chromecast/command', payload);
}

module.exports = robot => {
  robot.respond(/radio (.*)?/i, msg => {
    const send = msg.send.bind(msg);
    const stationId = msg.match[1] && msg.match[1].trim();
    if (stationId == 'stations') {
      let formattedStations = '';
      for (const station of stations) {
        formattedStations += `\`${station.id}\`: ${station.name}\n`;
      }
      return send(formattedStations);
    }

    if (!isRadioStation(stationId)) {
      return send(
        'Jeg klarte ikke å finne den radiostasjonen.\nSkriv `hubot radio stations` for å se listen'
      );
    }

    const station = stations.find(station => station.id == stationId);

    playRadioStation(station);
    robot.adapter.client.web.reactions.add('radio', {
      channel: msg.message.room,
      timestamp: msg.message.id
    });
  });
};
