// Description:
// Get all phone numbers for active members

const _ = require('lodash');
const members = require('../lib/members');

module.exports = robot => {
  robot.hear(/nummer/i, msg => {
    members('?active=true')
      .then(members => {
        if (members.length === 0) {
          return;
        }
        msg.send(
          members
            .map(
              m =>
                `\`*${m.name}*:${'\t'} ${m.phone_number.substr(
                  0,
                  3
                )} ${m.phone_number
                  .substr(3)
                  .match(/.{1,2}/g)
                  .join(' ')}\``
            )
            .sort()
            .join('\n')
        );
      })
      .catch(error => msg.send(error.message));
  });
};
