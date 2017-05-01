const Promise = require('bluebird');
const path = require('path');
const Nexmo = require('nexmo');
const express = require('express');
const moment = require('moment');
const polly = require('../lib/polly');
const members = require('../lib/members');

const {
  NEXMO_API_KEY,
  NEXMO_API_SECRET,
  NEXMO_APPLICATION_ID,
  NEXMO_PRIVATE_KEY,
  EXPRESS_STATIC,
  PHONE_PIZZA,
  PHONE_FROM,
  URL
} = process.env;

const store = {};

const nexmo = new Nexmo({
  apiKey: NEXMO_API_KEY,
  apiSecret: NEXMO_API_SECRET,
  applicationId: NEXMO_APPLICATION_ID,
  privateKey: NEXMO_PRIVATE_KEY
});

const calls = Promise.promisifyAll(nexmo.calls);
const stream = Promise.promisifyAll(nexmo.calls.stream);

const call = () => calls.createAsync({
    to: [{
      type: 'phone',
      number: PHONE_PIZZA
    }],
    from: {
      type: 'phone',
      number: PHONE_FROM
    },
    answer_url: [`${URL}/answer`]
  });

function generateErrorMessage(errorMessage) {
  return 'Feil: ' + errorMessage + '\n\n' +
         'Bestillingsformat: ' + pizzaOrderFormat;
}

function getPizzaName(slackName) {
  return members(`?slack=${slackName}`)
    .then((body) => {
      const user = body[0];

      if (!user || !user.name) {
        throw new Error(`Fant ikke ${slackName} i medlemmer.`);
      }

      return user.name.split(' ', 1)[0]; // Get first name only
    });
}

module.exports = (robot) => {
  robot.router.use(`/${EXPRESS_STATIC}`, express.static(path.join(__dirname, '..', EXPRESS_STATIC)))

  robot.react((msg) => {
    if (msg.message.type == 'added'
      && msg.message.item_user.name == 'hubot'
      && msg.message.reaction == 'white_check_mark'
      && msg.message.room in currentOrders
      && (Math.floor(Date.now() / 1000) - currentOrders[msg.message.room].time) <= 60) { // Must react within 1 minute
        const currentOrder = currentOrders[msg.message.room];
        polly({
            pizzas: currentOrder.pizzas,
            pickupTime: currentOrder.pickupTime,
            name: currentOrder.name
          }) // FIXME: just pass the whole currentOrder Object?
          .then(() => call())
          .then((data) => {
            store[data.conversation_uuid] = {
              channel: msg.message.room,
              timestamp: msg.message.id
            };
            robot.adapter.client.web.reactions.add(
              'pizza',
              {
                channel: msg.message.room,
                timestamp: msg.message.id
              }
            )
          })
          .catch((err) => {
            robot.adapter.client.web.reactions.add(
              'x',
              {
                channel: msg.message.room,
                timestamp: msg.message.id
              }
            )
          })
        );
    }
  });

  robot.respond(/pizza ( .*)?/i, (msg) => {
    const send = msg.send.bind(msg);
    const slackName = msg.match[1] ? msg.match[1].trim() : msg.message.user.name;
      getPizzaName(slackName)
      .then((name) => {
        const orderArray = msg.message.text.split(' ');
        // Remove the first two items (bot name & command)
        orderArray.splice(0, 2);

        // Too many or too few arguments
        if (orderArray.length !== 2) {
          msg.send(generateErrorMessage('For få argumenter (.length !== 2)'))
          return;
        }

        // Check pickup time
        const pickupTimeString = orderArray.splice(-1, 1);
        let orderPickupTime = moment(pickupTimeString, 'HH:mm');
        if (!orderPickupTime.isValid()) {
          msg.send(generateErrorMessage(
            'Klokkeslettet for henting må være i følgende format: HH:mm'
          ));
          return;
        }
        orderPickupTime = orderPickupTime.format('HH:mm');

        // Check if the pizzas are valid
        const pizzaIds = orderArray[0].split(',');
        const orderPizzas = {};
        for (var i = 0, len = pizzaIds.length; i < len; i++) {
          if (isNaN(pizzaIds[i])) {
            // ID is not a number
            msg.send(generateErrorMessage(
              pizzaIds[i] + ' er ikke et gyldig pizza nummer'
            ));
            return;
          }

          const pizzaId = parseInt(pizzaIds[i], 10);

          if (pizzaId < 1 || pizzaId > 28) {
            // Out of pizza id range
            msg.send(generateErrorMessage(
              'Pizza nummer må være fra 1 til og med 28, "' +
              pizzaId + '" er utenfor'
            ));
            return;
          }

          if (orderPizzas[pizzaId]) {
            orderPizzas[pizzaId] += 1;
          } else {
            orderPizzas[pizzaId] = 1;
          }
        }

        // Format the order to a pretty string
        const orderTextPretty = Object.keys(orderPizzas).map((pizzaId) => {
          const count = orderPizzas[pizzaId];
          return `${count}x ${pizzaId}`;
        });

        // Set the current order
        currentOrders[msg.message.room] = {
          id: msg.message.id,
          room: msg.message.room,
          time: Math.floor(msg.message.id),
          name: name,
          pickupTime: orderPickupTime,
          pizzas: pizzaIds
        };

        // Send a confirmation message
        msg.send(
          'React med :white_check_mark: på denne meldingen ' +
          'for å bekrefte bestillingen på ' + pizzaIds.length +
          ' pizza: ' + orderTextPretty.join(', ') +
          ' som skal hentes kl. ' + orderPickupTime
       );
      })
      .catch((error) => send(error.message))
  });

  robot.router.get('/answer', (req, res) => {
    robot.adapter.client.web.reactions.add(
      'phone',
      store[req.query.conversation_uuid]
    )
    res.json([
      {
        action: 'stream',
        level: 1,
        bargeIn: 'true',
        streamUrl: [`${URL}/${EXPRESS_STATIC}/order.mp3`]
      },
      {
        action: 'input',
        timeOut: 1,
        eventUrl: [`${URL}/response`]
      }
    ]);
  });

  robot.router.post('/response', (req, res) => {
    if (req.body.dtmf === '1') {
      robot.adapter.client.web.reactions.add(
        'white_check_mark',
        store[req.body.conversation_uuid]
      )
      res.json([
        {
          action: 'stream',
          level: 1,
          streamUrl: [`${URL}/${EXPRESS_STATIC}/complete.mp3`]
        }
      ]);
    }

    if (req.body.dtmf === '2') {
      robot.adapter.client.web.reactions.add(
        'snail',
        store[req.body.conversation_uuid]
      )
      res.json([
        {
          action: 'stream',
          level: 1,
          bargeIn: 'true',
          streamUrl: [`${URL}/${EXPRESS_STATIC}/order.mp3`]
        },
        {
          action: 'input',
          timeOut: 1,
          eventUrl: [`${URL}/response`]
        }
      ]);
    }
  });
};
