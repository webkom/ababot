// Description:
//   Buy soda or list balance
// Configuration:
//   SODA_TOKEN,
//   SODA_URL,
//   MEMBERS_URL
// Commands
//   hubot kjøp brus <name> - Buy a soda at the office.
//   hubot saldo brus <name> - Get your saldo at brus.abakus.no

const _ = require('lodash');
const fetch = require('node-fetch');
const members = require('../lib/members');

const { SODA_TOKEN, SODA_URL } = process.env;

function brus(path, options = {}) {
  return fetch(
    `${SODA_URL}/api/liste${path}`,
    Object.assign(
      {
        method: 'GET',
        headers: {
          Authorization: `Token ${SODA_TOKEN}`,
          'Content-Type': 'application/json'
        }
      },
      options
    )
  );
}

function getSodaName(slackName) {
  return members(`?slack=${slackName}`).then(body => {
    const user = body[0];

    if (!user || !user.brus) {
      throw new Error(`Fant ikke ${slackName} på brus.`);
    }

    return user.brus;
  });
}

function purchaseSoda(slackName, sodaType) {
  return getSodaName(slackName).then(name => {
    return brus(`/purchase_${sodaType}/`, {
      method: 'POST',
      body: JSON.stringify({
        name
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Jeg klarte ikke å kjøpe brusen');
        }

        return response.json();
      })
      .then(
        body =>
          `Du fikk kjøpt en brus ${sodaType == 'bottle' ? 'flaske' : 'boks'}, ${
            body.name
          } sin nye saldo er ${body.balance}. ${body.name} har kjøpt ${
            body.soda_bottles_bought
          } flasker og ${body.soda_cans_bought} bokser brus.`
      );
  });
}

module.exports = robot => {
  robot.respond(/kjøp øl/i, msg => {
    robot.adapter.client.web.reactions.add('beer', {
      channel: msg.message.room,
      timestamp: msg.message.id
    });
  });

  robot.respond(/kjøp shot/i, msg => {
    robot.adapter.client.web.reactions.add('cocktail', {
      channel: msg.message.room,
      timestamp: msg.message.id
    });
  });

  robot.respond(/kjøp brus flaske/i, msg => {
    const send = msg.send.bind(msg);
    purchaseSoda(msg.message.user.name, 'bottle')
      .then(send)
      .catch(error => send(error.message));
  });

  robot.respond(/kjøp brus boks/i, msg => {
    const send = msg.send.bind(msg);
    purchaseSoda(msg.message.user.name, 'can')
      .then(send)
      .catch(error => send(error.message));
  });

  robot.respond(/saldo brus( .*)?/i, msg => {
    const send = msg.send.bind(msg);
    const slackName = msg.match[1]
      ? msg.match[1].trim()
      : msg.message.user.name;

    getSodaName(slackName)
      .then(name => {
        return brus(`/${name}/`)
          .then(response => {
            if (response.status !== 200) {
              throw new Error(
                `Jeg klarte ikke hente info fra brus (${response.status}).`
              );
            }

            return response.json();
          })
          .then(
            body =>
              `${body.name} sin saldo er ${body.balance} spenn. ${
                body.name
              } har kjøpt totalt ${body.soda_bottles_bought} flasker og ${
                body.soda_cans_bought
              } bokser brus.`
          );
      })
      .then(send)
      .catch(error => send(error.message));
  });
};
