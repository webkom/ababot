// Description:
//   Display the numbers of the active pool
//
// Commands
//   hubot numbers - Reply with name/number of all active members
//   hubot number [name] - Reply with name/number any members in members

const _ = require('lodash');
const members = require('../lib/members');
const logger = require('../lib/log');
const FuzzySearch = require('fuzzy-search');

module.exports = (robot) => {
  robot.respond(/number (.*)?/i, (msg) => {
    logger.log(msg);
    members()
      .then((members) => {
        if (members.length === 0) {
          msg.send('Noe er feil med members, fant ingen medlemmer');
          return;
        }

        const searcher = new FuzzySearch(members, [
          'name',
          'slack',
          'github',
          'brus',
        ]);

        const searchName = msg.message.text.split(' ')[2];

        if (!searchName) {
          msg.send('Fant ikke noe navn og søke på');
          return;
        }

        const user = searcher.search(searchName)[0];

        if (!user) {
          msg.send(`Fant ikke medlem ${msg.message} :(`);
          return;
        }

        if (user.phone_number == '') {
          msg.send(`Fant bruker ${user.name}, men de har ikke noe nummer`);
          return;
        }

        msg.send(
          `*${user.name}*:${'\t'} ${user.phone_number.substr(
            0,
            3
          )} ${user.phone_number
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
