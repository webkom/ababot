// Description:
//   Display the numbers of the active pool
//
// Commands
//   hubot nummber - Reply with name/number of all active members

const _ = require('lodash');
const members = require('../lib/members');
const logger = require('../lib/log');

module.exports = (robot) => {
  robot.respond(/number (.*)?/i, (msg) => {
    logger.log(msg);
    members()
      .then((members) => {
        if (members.length === 0) {
          return;
        }
        console.log('Members', members);
        console.log('Message', msg);
        const member = members.find((mem) => mem.name == msg.message);
        if (!member) {
          msg.send(`Fant ikke medlem ${msg.message} :(`);
        }
        member &&
          msg.send(
            `*${m.name}*:${'\t'} ${m.phone_number.substr(0, 3)} ${m.phone_number
              .substr(3)
              .match(/.{1,2}/g)
              .join(' ')}`
          );
      })
      .catch((error) => msg.send(error.message));
  });

  robot.respond(/numbers/i, (msg) => {
    logger.log(msg);
    members('?active=true')
      .then((members) => {
        if (members.length === 0) {
          return;
        }
        msg.send(
          members
            .map(
              (m) =>
                `*${m.name}*:${'\t'} ${m.phone_number.substr(
                  0,
                  3
                )} ${m.phone_number
                  .substr(3)
                  .match(/.{1,2}/g)
                  .join(' ')}`
            )
            .sort()
            .join('\n')
        );
      })
      .catch((error) => msg.send(error.message));
  });
};
