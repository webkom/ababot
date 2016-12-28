// Description:
//   Show Abakus coffee status
//
// Commands:
// hubot kaffe - Replay with information about the coffee brewer at the Abakus-office.

const moment = require('moment');

module.exports = (robot) => {
  robot.respond(/kaffe$/i, (msg) => {
      msg.http('https://kaffe.abakus.no/api/status').get()(
        (err, res, body) => {
          json = JSON.parse(body).coffee;
          status = json.status ? 'på' : 'av';
          last = moment(json.last_start, 'YYYY-MM-DD HH:mm', 'nb').fromNow();
          msg.send(`Kaffetrakteren er ${status}. Den ble sist skrudd på ${last}.`);
        }
      );
  });
};
