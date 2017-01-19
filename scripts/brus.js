// Description:
//   Buy soda or list balance
// Configuration:
//   SODA_TOKEN,
//   SODA_URL
// Commands
//   hubot kjøp brus <name> - Buy a soda at the office.
//   hubot saldo brus <name> - Get your saldo at brus.abakus.no

const _ = require('lodash');

const token = process.env.SODA_TOKEN;
const url = `${process.env.SODA_URL}/api/liste`

const callAPI = (msg, path) =>
  msg
    .http(`${url}${path}`)
    .header('Authorization', `Token ${token}`)
    .header('Content-Type', 'application/json');

module.exports = (robot) => {

  robot.respond('/kjøp brus (.*)/i', (msg) => {
    callAPI(msg, '/purchase/').post(JSON.stringify({ name: 'Sylliaas' }))((err, res, body) => {
      if (!err) {
        if (res.statusCode == 201) {
          const json = JSON.parse(body);
          msg.send(`Du fikk kjøpt en brus, ${json.name} sin nye saldo er ${json.balance}`)
        } else {
          msg.send('Jeg klarte ikke å kjøpe brusen');
        }
      }
    });
  });

  robot.respond('/saldo brus (.*)/i', (msg) => {
    callAPI(msg, `/${msg.match[1]}/`).get()((err, res, body) => {
      if (!err) {
        if (res.statusCode == 200) {
          const json = JSON.parse(body);
          msg.send(`${json.name} sin saldo er ${json.balance}`)
        } else {
          msg.send('Jeg klarte ikke hente info fra brus');
        }
      }
    });
  });

};
