// Description:
//   Buy soda or list balance
//
// Configuration:
//   SODA_TOKEN,
//   SODA_URL,
//   MEMBERS_URL
//
// Commands
//   hubot kjøp <produkt_navn> - Purchase a product from Brus
//   hubot brus produkter - Get a list of products from brus.abakus.no
//   hubot saldo brus - Get your balance brus.abakus.no

const _ = require('lodash');
const fetch = require('node-fetch');
const members = require('../lib/members');

const { SODA_TOKEN, SODA_URL } = process.env;

const sodaMappings = {
  ':dahls:': 'beer_dahls_bottle',
  ':dahls-jul:': 'beer_dahls_jul_bottle'
};

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
function getProducts() {
  return brus(`/products/`, {
    method: 'GET'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Jeg klarte ikke hente produktene fra brus`);
      }
      return response.json();
    })
    .then(body => {
      return body
        .map(product => `- \`${product.key}\`: ${product.current_price} kr`)
        .join('\n');
    });
}

function purchaseSoda(slackName, sodaType) {
  return getSodaName(slackName).then(name => {
    return brus(`/purchase/`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        shopping_cart: [
          {
            product_name: sodaMappings[sodaType] || sodaType,
            count: 1
          }
        ]
      })
    }).then(response => {
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            `Jeg klarte ikke å kjøpe brusen: fant ikke noe produkt med navnet \`${sodaType}\`\nSkriv \`hubot brus produkter\` for å se listen`
          );
        } else {
          throw new Error(`Jeg klarte ikke å kjøpe brusen: ${response.status}`);
        }
      }

      return response.json();
    });
  });
}

module.exports = robot => {
  robot.respond(/kjøp (.*)?/i, msg => {
    const send = msg.send.bind(msg);
    const productName = msg.match[1].trim();
    purchaseSoda(msg.message.user.name, productName).catch(error =>
      send(error.message)
    );
  });

  robot.respond(/brus produkter/i, msg => {
    const send = msg.send.bind(msg);
    getProducts()
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
            // TODO: list products
            body =>
              `${body.name} sin saldo er ${
                body.balance
              } spenn. (TODO: produktliste, @noen fix)`
          );
      })
      .then(send)
      .catch(error => send(error.message));
  });
};
