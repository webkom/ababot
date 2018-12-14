const _ = require('lodash');
const presence = require('../lib/presence');

const createMention = username => `@${username}`;

module.exports = robot => {
  robot.hear(/@kontoret|@office/i, msg => {
    // Reply with a message containing mentions of members at the office.
    presence()
      .then(members => {
        if (members.length === 0) {
          return;
        }

        msg.send(
          members
            .filter(member => member.is_active)
            .map(member => createMention(member.slack))
            .join(', ')
        );
      })
      .catch(error => msg.send(error.message));
  });
};
