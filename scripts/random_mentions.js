// Description:
//   Random scripts
//
// Commands
//   @referent - Reply with the current reff
//   hubot rm -rf - Reply with bully message

module.exports = (robot) => {
  robot.hear(/@referent/i, (msg) => msg.send('@martinrf'));
  robot.hear(/rm -rf/i, (msg) => msg.send('Ikke gjør det @pedersmith!!!!'));
};
