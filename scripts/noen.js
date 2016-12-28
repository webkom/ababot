// Description:
//   Pick and tag a random user that has to do shitty work, replies when the bot
//   hears @noen. This script also supports mentions of @aktive and @nye.
// Configuration:
//   MEMBERS,
//   NYE

const _ = require('lodash');

const prefixes = [
    'Time to shine', "The work doesn't do itself", 'Get going', 'lol rekt',
    'About time you got picked', 'RIP', 'Move it'
];

let members = [];
if (process.env.MEMBERS) {
    members = process.env.MEMBERS.split(',').map((member) => member.trim());
}

let new_members = [];
if (process.env.NEW) {
    new_members = process.env.NEW.split(',').map((member) => member.trim());
}

const createMention = (username) => `@${username}`;

module.exports = (robot) => {

  robot.hear(/@noen/i, (msg) => {
    // Reply with a cheesy message and a random picked mention.
    if (!_.isEmpty(members)) {
      const lucky_member = _.sample(members);
      const mention = createMention(lucky_member);
      const cheesy_prefix = _.sample(prefixes);
      msg.send(`${cheesy_prefix} ${mention}`);
    }
  });

  robot.hear(/@aktive/i, (msg) => {
    // Reply with a message containing mentions of all active users.
    if (!_.isEmpty(members)) {
      msg.send(members.map((member) => createMention(member)).join(', '));
    }
  });

  robot.hear(/@nye/i, (msg) => {
    // Reply with a message containing mentions of all new users.
    if (!_.isEmpty(new_members)) {
      msg.send(new_members.map((member) => createMention(member)).join(', '));
    }
  });

};
