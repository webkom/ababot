// Description:
//   Control the TV (via Chromecast)
// Configuration:
//   MEMBERS_URL,
//   OPENFAAS_URL,
// Commands
//   hubot pump kaffe - Fetches the kaffe_volume from the Medlemmer API and starts the pump.
//   hubot pump <centiliters> - Pumps a specific amount of centiliters (cL), has to be between or equal to 1 and 50.
//   hubot pump shot <count> - Pumps a certain number of 4 cL shots, has to be between or equal to 1 and 4.

const _ = require('lodash');
const members = require('../lib/members');
const openFaas = require('../lib/openfaas');
const logger = require('./log');

function getKaffeVolume(slackName) {
  return members(`?slack=${slackName}`).then(body => {
    const user = body[0];

    if (!user || !user.kaffe_volume) {
      throw new Error(`Fant ikke kaffe_volume for ${slackName}.`);
    }

    return user.kaffe_volume;
  });
}

function sendCommand(command, additional = {}) {
  const payload = { ...additional, command };
  return openFaas('kaffe-pump-api', {
    method: 'POST',
    body: JSON.stringify(payload)
  }).then(response => {
    return;
  });
}

async function startPump(slackName, centiliters, name = 'kaffe', count = 1) {
  return sendCommand('pump_out', {
    centiliters: centiliters * count
  }).then(response => {
    if (!response.ok) {
      throw new Error(
        `Jeg klarte ikke å pumpe kaffen: HTTP ${response.status}`
      );
    }
    if (name == 'shot') {
      return (
        'Starter å pumpe' +
        (count > 1 ? ` ${count} x ` : ' ') +
        `${centiliters} cL ${count > 1 ? 'shots' : 'shot'} til ${slackName}`
      );
    } else {
      return `Starter å pumpe ${centiliters} cl ${name} til ${slackName}`;
    }
  });
}

module.exports = robot => {
  robot.respond(/pump kaffe/i, msg => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    const slackName = msg.message.user.name;
    getKaffeVolume(slackName)
      .then(kaffe_volume => {
        return startPump(slackName, kaffe_volume);
      })
      .then(message => {
        robot.adapter.client.web.reactions.add('coffee', {
          channel: msg.message.room,
          timestamp: msg.message.id
        });
        send(message);
      })
      .catch(error => send(error.message));
  });
  robot.respond(/pump shot( \d{1,4})?/i, msg => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    const slackName = msg.message.user.name;
    let shotCount = 1;
    if (msg.match[1] !== undefined) {
      let parsedCount = parseInt(msg.match[1].trim());
      if (isNaN(parsedCount)) {
        // Ignore the int as it's not a number
        return;
      }
      if (parsedCount > 4) {
        parsedCount = 4;
      } else if (parsedCount < 0) {
        parsedCount = 0;
      }
      shotCount = parsedCount;
    }
    startPump(slackName, 4, 'shot', shotCount)
      .then(message => {
        robot.adapter.client.web.reactions.add('cocktail', {
          channel: msg.message.room,
          timestamp: msg.message.id
        });
        send(message);
      })
      .catch(error => send(error.message));
  });
  robot.respond(/pump (\d{1,50})/i, msg => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    const slackName = msg.message.user.name;
    if (msg.match[1] === undefined) {
      return;
    }
    let centiliters = msg.match[1].trim();
    let parsedCentiliters = parseInt(centiliters);
    if (isNaN(parsedCentiliters)) {
      // Ignore the int as it's not a number
      return;
    }
    if (parsedCentiliters > 50) {
      parsedCentiliters = 50;
    } else if (parsedCentiliters < 0) {
      parsedCentiliters = 0;
    }
    startPump(slackName, parsedCentiliters, 'ukjent væske')
      .then(message => {
        robot.adapter.client.web.reactions.add('baby_bottle', {
          channel: msg.message.room,
          timestamp: msg.message.id
        });
        send(message);
      })
      .catch(error => send(error.message));
  });
};
