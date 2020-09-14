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
          'full_name',
          'slack',
          'github',
          'brus',
        ]);

        const searchName = msg.message.text.split(' ')[2];

        if (!searchName) {
          return;
        }

        const results = searcher.search(searchName);
        if (results.length == 0) {
          msg.send(`Fant ingen medlemmer ved søket: ${searchName}`);
          return;
        }

        results.forEach((res) => {
          if (res.phone_number == '') {
            msg.send(`Fant bruker ${res.name}, men de har ikke noe nummer`);
          } else {
            msg.send(`Fant bruker ved navn: *${res.name}*, nummer:`);
            msg.send(`${res.phone_number}`);
          }
        });
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
