// Description:
//   Control the lasers at our office (rave!)
// Configuration:
//   OPENFAAS_URL,
// Commands
//   hubot rave on - Turn on the lasers
//   hubot rave off - Turn off the lasers
//   hubot rave lock - Lock the power state of the lasers so it cannot be changed by other applications
//   hubot rave unlock - Unlock the power state of the lasers so it can be changed by other applications

const _ = require('lodash');
const openFaas = require('../lib/openfaas');
const mqttPublish = require('../lib/mqtt');
const logger = require('../lib/log');

function sendCommand(command) {
  payload = {
    command
  };

  return openFaas('office-lasers-api', {
    method: 'POST',
    body: JSON.stringify(payload)
  }).then(response => {
    return;
  });
}

module.exports = robot => {
  robot.respond(/rave off/i, msg => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    sendCommand('force_power_off').catch(error => send(error.message));
    robot.adapter.client.web.reactions.add('cry', {
      channel: msg.message.room,
      timestamp: msg.message.id
    });
  });
  robot.respond(/rave on/i, msg => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    sendCommand('force_power_on').catch(error => send(error.message));

    const voiceCommand = {
      command: 'say',
      text: 'nu kör vi',
      voice_name: 'sv'
    };
    mqttPublish('office_say/command', voiceCommand);
    robot.adapter.client.web.reactions.add('middleparrot', {
      channel: msg.message.room,
      timestamp: msg.message.id
    });
  });
  robot.respond(/rave lock/i, msg => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    sendCommand('power_lock').catch(error => send(error.message));
    robot.adapter.client.web.reactions.add('lock', {
      channel: msg.message.room,
      timestamp: msg.message.id
    });
  });
  robot.respond(/rave unlock/i, msg => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    sendCommand('power_unlock').catch(error => send(error.message));
    robot.adapter.client.web.reactions.add('unlock', {
      channel: msg.message.room,
      timestamp: msg.message.id
    });
  });
};
