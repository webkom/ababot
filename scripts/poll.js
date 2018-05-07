// Description:
//   Create poll
// Commands
//   hubot poll "<pollName>" "<option0>" "<option1>" "<option2>" ... - Create and post poll with given options

const _ = require('lodash');

const createPoll = message => {
  const [name, ...options] = (message.match(/\".+?\"/g) || []).map(string =>
    string.replace(/\"/g, '')
  );
  return { name, options };
};

const createResponse = poll => {
  const reactionPool = _.shuffle([
    ':shitpost:',
    ':rask:',
    ':mord:',
    ':ekern:',
    ':eddie:',
    ':rekt:',
    ':jakt:'
  ]);
  return `Poll: ${poll.name}${poll.options
    .map(
      option =>
        `${reactionPool.length ? reactionPool.pop() : ':rip:'}: ${option}`
    )
    .reduce((a, b) => a + '\n' + b, '')}`;
};

module.exports = robot => {
  robot.respond(/poll/i, msg => {
    const poll = createPoll(msg.message.text);
    if (poll.name) {
      const response = createResponse(poll);
      msg.send(response);
    }
  });
};
