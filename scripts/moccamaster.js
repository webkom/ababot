// Description:
//   Show Abakus coffee status
//
// Commands:
// hubot kaffe - Replay with information about the coffee brewer at the webkom-office.

const token = process.env.MOCCAMASTER_TOKEN;
const coffeeChannel = process.env.MOCCAMASTER_CHANNEL || '#kaffebot';
const moment = require('moment');
const log = console.log;
moment.locale('nb-NO');

module.exports = robot => {
  robot.router.post('/moccamaster', (request, response) => {
    const authorization = request.headers.authorization;

    if (token !== authorization) {
      log(`Token denied, ${authorization}`);
      return response.status(401).json({ details: 'Invalid token' });
    }

    // Store status in memory
    robot.brain.set('moccamasterLastBrew', moment());

    // Post brewing done in slack
    robot.messageRoom(
      coffeeChannel,
      'Det er nytraktet kaffe på kontoret! :coffee:'
    );

    return response.json({ details: `success` });
  });
  robot.respond(/kaffe$/i, msg => {
    const lastBrew = robot.brain.get('moccamasterLastBrew');
    if (lastBrew) {
      const last = moment(lastBrew).fromNow();
      msg.send(`Kaffe ble sist brygget ${last}.`);
    } else {
      msg.send('Jeg husker ikke sist det ble brygget kaffe ¯\\_(ツ)_/¯');
    }
  });
};
