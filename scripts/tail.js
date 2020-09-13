// Description:
//  Tail the logs of a command
//
// Commands
//   hubot tail [options] <command>

const logger = require('../lib/log');

module.exports = (robot) => {
  robot.respond(/tail (.*)?/i, (msg) => {
    logger.tail(msg);
  });
};
