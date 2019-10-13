// Description:
//   Check the door status
//
// Commands
//   hubot door - Reply with the door status

const _ = require('lodash');
const officeDoor = require('../lib/office_door');
const logger = require('../lib/log');

const { SENTRY_DSN } = process.env;
const Sentry = require('@sentry/node');

module.exports = robot => {
  robot.respond(/door/i, msg => {
    logger.log(msg);

    // TEST SENTRY ERRORS
    Sentry.init({ dsn: SENTRY_DSN });
    console.log('DSN: ', SENTRY_DSN);
    Sentry.captureMessage('Do you even work?');
    console.log('The lastEventId is:', Sentry.lastEventId());
    undefinedFunction();
    // TEST SENTRY ERRORS

    // Reply with the status of the door
    officeDoor()
      .then(door => {
        const date = new Date(door.last_datetime);
        const doorStatus = door.status == 'OPEN' ? 'ÅPEN' : 'LUKKET';
        msg.send(
          date.toLocaleString('en-US', (options = { hour12: false })) +
            ' - Døren på kontoret er ' +
            doorStatus
        );
      })
      .catch(error => msg.send(error.message));
  });
};
