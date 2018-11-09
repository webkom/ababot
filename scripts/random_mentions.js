module.exports = robot => {
  robot.hear(/@referent/i, msg => msg.send('@martinrf'));
  robot.hear(/rm -rf/i, msg => msg.send('Ikke gjør det @pedersmith!!!!'));
};
