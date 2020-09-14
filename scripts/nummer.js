// Description:
//   Display the numbers of the active pool
//
// Commands
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
          msg.send(
            '503 SERVICE UNAVAILABLE: \n Something is wrong with the MemebersAPI'
          );
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
          msg.send('400 BAD REQUEST: \n No keyword detected');
          return;
        }

        if (searchName.length < 3) {
          msg.send(
            '451 UNAVAILABLE FOR LEGAL REASONS: \n Keyword to short, too many results'
          );
          return;
        }

        const results = searcher.search(searchName);
        if (results.length == 0) {
          msg.send(
            `404 NOT FOUND. \n Found no match for the keyword: ${searchName}`
          );
          return;
        }

        results.forEach((res) => {
          if (res.phone_number == '') {
            msg.send(
              `410 GONE. \n Found user: ${res.name}, but they have no number`
            );
          } else {
            msg.send(
              `200 OK \n Name: *${res.name}* <tel:${res.phone_number}|${res.phone_number}>`
            );
          }
        });
      })
      .catch((error) => msg.send(error.message));
  });
};
