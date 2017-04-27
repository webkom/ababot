const Promise = require('bluebird');
const path = require('path');
const Nexmo = require('nexmo');
const express = require('express');
const polly = require('../lib/polly');

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

module.exports = (robot) => {
  robot.router.use(`/${EXPRESS_STATIC}`, express.static(path.join(__dirname, '..', EXPRESS_STATIC)))

  robot.respond(/pizza/i, (msg) => {
    polly({
        pizzas: [12, 22],
        pickupTime: '12:30',
        name: 'Webkom'
      })
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
