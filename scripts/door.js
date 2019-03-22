const _ = require('lodash');
const officeDoor = require('../lib/office_door');

module.exports = robot => {
  robot.hear(/door/i, msg => {
    // Reply with the status of the door
    officeDoor()
      .then(door => {
        // TODO: Change from isoformat to time since?
        const lastDatetime = door.last_datetime;
        const doorStatus = door.status == 'OPEN' ? 'ÅPEN' : 'LUKKET';
        msg.send(
          'Døren på kontoret er ' + doorStatus + '. Siste data: ' + lastDatetime
        );
      })
      .catch(error => msg.send(error.message));
  });
};
