// Description:
//   Pick and tag a random user
//
// Commands
//  @noen - Pick a random person from the active pool
//  @nye - Tag all new members
//  @active - Tagg all active memebers

const _ = require('lodash');
const members = require('../lib/members');
const fetch = require('node-fetch');
const { SODA_TOKEN, SODA_URL } = process.env;

const prefixes = [
  'Time to shine',
  "The work doesn't do itself",
  'Get going',
  'lol rekt',
  'About time you got picked',
  'RIP',
  'Move it',
];

const createMention = (username) => `@${username}`;

function brus(path, options = {}) {
  return fetch(
    `${SODA_URL}/api/liste${path}`,
    Object.assign(
      {
        method: 'GET',
        headers: {
          Authorization: `Token ${SODA_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
      options
    )
  );
}

module.exports = (robot) => {
  robot.hear(/@noen-nye/i, (msg) => {
    members('?new=true')
      .then((members) => {
        if (!members.length) {
          return;
        }

        const luckyMember = _.sample(members);
        const mention = createMention(luckyMember.slack);
        const cheesyPrefix = _.sample(prefixes);
        msg.send(`${cheesyPrefix} ${mention}`);
      })
      .catch((error) => msg.send(error.message));
  });

  robot.hear(/@noen/i, (msg) => {
    // Reply with a cheesy message and a random picked mention.
    members('?active=true')
      .then((members) => {
        if (!members.length) {
          return;
        }

        const luckyMember = _.sample(members);
        const mention = createMention(luckyMember.slack);
        const cheesyPrefix = _.sample(prefixes);
        msg.send(`${cheesyPrefix} ${mention}`);
      })
      .catch((error) => msg.send(error.message));
  });

  robot.hear(/@aktive|@active/i, (msg) => {
    // Reply with a message containing mentions of all active users.
    members('?active=true')
      .then((members) => {
        if (members.length === 0) {
          return;
        }

        msg.send(
          members.map((member) => createMention(member.slack)).join(', ')
        );
      })
      .catch((error) => msg.send(error.message));
  });

  robot.hear(/@nye/i, (msg) => {
    members('?new=true')
      .then((members) => {
        if (members.length === 0) {
          return;
        }

        msg.send(
          members.map((member) => createMention(member.slack)).join(', ')
        );
      })
      .catch((error) => msg.send(error.message));
  });

  robot.hear(/@gamle/i, (msg) => {
    members('?active=false')
      .then((members) => {
        if (members.length === 0) {
          return;
        }

        msg.send(
          members.map((member) => createMention(member.slack)).join(', ')
        );
      })
      .catch((error) => msg.send(error.message));
  });

  robot.hear(/@wall-of-shame/i, (msg) => {
    members('?active=true').then((members) => {
      brus('/')
        .then((response) => {
          if (response.status !== 200) {
            throw new Error(`Brus is dead (${response.status}).`);
          }
          return response.json();
        })
        .then((users) => {
          const shamers = _.sortBy(
            users.filter((user) => user.balance < 0),
            ['balance']
          );

          const mappedShamers = shamers
            .map((shamer) => [
              shamer,
              members.find((member) => member.brus === shamer.name),
            ])
            .filter((val) => !!val[1]);
          msg.send(
            mappedShamers
              .map(
                ([brus, member]) =>
                  `${createMention(member.slack)} (${brus.balance})`
              )
              .join(', ')
          );
        })
        .catch((error) => msg.send(error.message));
    });
  });
  robot.hear(/@hall-of-fame/i, (msg) => {
    members('?active=true').then((members) => {
      brus('/')
        .then((response) => {
          if (response.status !== 200) {
            throw new Error(`Brus is dead (${response.status}).`);
          }
          return response.json();
        })
        .then((users) => {
          const famers = _.sortBy(users, ['balance']).reverse().slice(0, 3);

          const mappedFamers = famers
            .map((famer) => [
              famer,
              members.find((member) => member.brus === famer.name),
            ])
            .filter((val) => !!val[1]);
          msg.send(
            mappedFamers
              .map(
                ([brus, member]) =>
                  `${createMention(member.slack)} (${brus.balance})`
              )
              .join(', ')
          );
        })
        .catch((error) => msg.send(error.message));
    });
  });
};
