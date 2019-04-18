// Description:
//   Check the door status
//
// Commands
//   hubot door - Reply with the door status

const _ = require('lodash');
const officeDoor = require('../lib/office_door');

module.exports = robot => {
  robot.respond(/door/i, msg => {
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
