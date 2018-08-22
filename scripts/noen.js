// Description:
//   Pick and tag a random user that has to do shitty work, replies when the bot
//   hears @noen. This script also supports mentions of @aktive and @nye.

const _ = require('lodash');
const members = require('../lib/members');

const prefixes = [
  'Time to shine',
  "The work doesn't do itself",
  'Get going',
  'lol rekt',
  'About time you got picked',
  'RIP',
  'Move it'
];

const createMention = username => `@${username}`;

module.exports = robot => {
  robot.hear(/@noen/i, msg => {
    // Reply with a cheesy message and a random picked mention.
    members('?active=true')
      .then(members => {
        if (!members.length) {
          return;
        }

        const luckyMember = _.sample(members);
        const mention = createMention(luckyMember.slack);
        const cheesyPrefix = _.sample(prefixes);
        msg.send(`${cheesyPrefix} ${mention}`);
      })
      .catch(error => msg.send(error.message));
  });

  robot.hear(/@aktive|@active/i, msg => {
    // Reply with a message containing mentions of all active users.
    members('?active=true')
      .then(members => {
        if (members.length === 0) {
          return;
        }

        msg.send(members.map(member => createMention(member.slack)).join(', '));
      })
      .catch(error => msg.send(error.message));
  });

  robot.hear(/@nye/i, msg => {
    members('?new=true')
      .then(members => {
        if (members.length === 0) {
          return;
        }

        msg.send(members.map(member => createMention(member.slack)).join(', '));
      })
      .catch(error => msg.send(error.message));
  });
};
