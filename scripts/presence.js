// Description:
//   Show people at the office

const token = process.env.PRESENCE_TOKEN;
const members = require('../lib/members');

module.exports = (robot) => {
  robot.router.post('/presence', (request, response) => {
    const authorization = request.headers.AUTHORIZATION;

    if (token !== authorization) {
      return response.json({ details: 'Invalid token' });
    }

    const { rfid } = request.body.payload ? request.body.payload : request.body;

    members(`?rfid=${rfid}`)
    .then((body) => {
      const user = body[0];

      if (!user || !user.github) {
        return response.json({ details: `${rfid} not found` });
      }

      console.log('SUCCESS :)')
      return response.json({ details: `Success` });
    });

  });
};
