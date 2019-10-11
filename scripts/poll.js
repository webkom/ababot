// Description:
//   Create poll
//
// Commands
//   hubot poll "<pollName>" "<option0>" "<option1>" "<option2>" ... - Create and post poll with given options
//   hubot poll\n<pollName>\n<option0>\n<option1>... - Create poll with new lines instead of quotation marks

const _ = require('lodash');
const logger = require('../lib/log');

const defaultReaction = 'x';

const createPoll = (message, reactionPool) => {
  const [name, ...options] = (message.match(/(\".+?\")|(\n.+)/g) || []).map(
    string => string.replace(/\"|\n/g, '')
  );
  return {
    name,
    options: options.map(option => ({
      reaction: reactionPool.length ? reactionPool.pop() : defaultReaction,
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
    logger.log(msg);
    robot.adapter.client.web.emoji
      .list()
      .then(r =>
        r.ok
          ? _.shuffle(
              Object.keys(r.emoji).filter(
                emoji => !r.emoji[emoji].startsWith('alias:')
              )
            )
          : []
      )
      .then(reactionPool => {
        const poll = createPoll(msg.message.text, reactionPool);
        if (poll.name && poll.options.length >= 2) {
          const response = createResponse(poll);
          robot.adapter.client.web.chat
            .postMessage(msg.message.room, response, { username: 'PaaS' })
            .then(r => {
              if (r.ok)
                poll.options
                  .filter(({ reaction }) => reaction !== defaultReaction)
                  .map(({ reaction }) =>
                    robot.adapter.client.web.reactions.add(reaction, {
                      channel: msg.message.room,
                      timestamp: r.ts
                    })
                  );
            });
        }
      });
  });
};
