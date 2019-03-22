const _ = require('lodash');
const officeDoor = require('../lib/office_door');

module.exports = robot => {
  robot.respond(/door/i, msg => {
    // Reply with the status of the door
    officeDoor()
      .then(door => {
        // TODO: Change from isoformat to time since?
        const date = new Date(door.last_datetime);
        const doorStatus = door.status == 'OPEN' ? 'ÅPEN' : 'LUKKET';
        msg.send(
          '[' + date.toUTCString() + ' ] - Døren på kontoret er ' + doorStatus
        );
      })
      .catch(error => msg.send(error.message));
  });
};
