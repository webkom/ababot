// Description:
//   Check who's at the office
//
// Commands
//   @kontoret / @office - Reply with everyone at the office

const _ = require('lodash');
const presence = require('../lib/presence');

const createMention = username => `@${username}`;

module.exports = robot => {
  robot.hear(/@kontoret|@office/i, msg => {
    // Reply with a message containing mentions of members at the office.
    presence()
      .then(presence => {
        const members = presence.members;

        if (members.length === 0) {
          msg.send('Ingen på kontoret akkurat nå :white_frowning_face:');
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
