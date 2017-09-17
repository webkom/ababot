// Description:
//   Show people at the office

const token = process.env.PRESENCE_TOKEN;
const members = require('../lib/members');
const log = console.log;

module.exports = (robot) => {
  robot.router.post('/presence', (request, response) => {
    const authorization = request.headers.authorization;

    if (token !== authorization) {
      log(`Token denied, ${authorization}`);
      return response.status(401).json({ details: 'Invalid token' });
    }

    const { rfid } = request.body.payload ? request.body.payload : request.body;

    members(`?rfid=${rfid}`)
    .then((body) => {
      const user = body[0];

      if (!user || !user.github) {
        return response.status(400).json({ details: `${rfid} not found` });
      }

      robot.messageRoom('#general', `${user.github} entered the office!`);

      return response.json({ details: `Success` });
    });

  });
};
