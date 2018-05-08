// Description:
//   Create poll
// Commands
//   hubot poll "<pollName>" "<option0>" "<option1>" "<option2>" ... - Create and post poll with given options

const _ = require('lodash');

const createPoll = message => {
  const [name, ...options] = (message.match(/\".+?\"/g) || []).map(string =>
    string.replace(/\"/g, '')
  );
  const reactionPool = _.shuffle([
    'shitpost',
    'rask',
    'mord',
    'ekern',
    'eddie',
    'rekt',
    'jakt',
    'long-snoot',
    'skrivermaster'
  ]);
  return {
    name,
    options: options.map(option => ({
      reaction: reactionPool.length ? reactionPool.pop() : 'rip',
      text: option
    }))
  };
};

const createResponse = poll => {
  return `Poll: ${poll.name}\n${poll.options
    .map(option => `:${option.reaction}:: ${option.text}`)
    .join('\n')}`;
};

module.exports = robot => {
  robot.respond(/poll/i, msg => {
    const poll = createPoll(msg.message.text);
    if (poll.name && poll.options.length >= 2) {
      const response = createResponse(poll);
      robot.adapter.client.web.chat
        .postMessage(msg.message.room, response)
        .then(r => {
          if (r.ok)
            poll.options
              .filter(({ reaction }) => reaction !== 'rip')
              .map(({ reaction }) =>
                robot.adapter.client.web.reactions.add(reaction, {
                  channel: msg.message.room,
                  timestamp: r.ts
                })
              );
        });
    }
  });
};
