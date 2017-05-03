const Promise = require('bluebird');
const path = require('path');
const AWS = require('aws-sdk');
const FS = require('fs');

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  EXPRESS_STATIC
} = process.env;

const fs = new Promise.promisifyAll(FS);
const Polly = new Promise.promisifyAll(new AWS.Polly({
  region: 'eu-west-1',
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY
}));


const integerToSpeechTextMap = [
  'èn', 'to', 'tre', 'fire', 'fem', 'seks', 'syv', 'åtte', 'ni', 'ti',
  'elleve', 'tolv', 'tretten', 'fjorten', 'femten', 'seksten', 'sytten', 'atten', 'nitten', 'tjue',
  'tjueèn', 'tjueto', 'tjuetre', 'tjuefire', 'tjuefem', 'tjueseks', 'tjuesyv', 'tjueåtte', 'tjueni',
  'tretti', 'trettièn', 'trettito', 'trettitre', 'trettifire', 'trettifem', 'trettiseks', 'trettisyv',
  'trettiåtte', 'trettini', 'førti', 'førtièn', 'førtito', 'førtitre', 'førtifire', 'førtifem', 'førtiseks',
  'førtisyv', 'førtiåtte', 'førtini', 'femti', 'femtito', 'femtitre', 'femtifire', 'femtifem', 'femtiseks',
  'femtisyv', 'femtiåtte', 'femtini', 'seksti'
];

const integerToSpeechText = integer => integerToSpeechTextMap[integer - 1];

module.exports = (order) => {
  order.numberOfPizzas = order.pizzas.length;
  const pizzas = {};
  order.pizzas.forEach((pizzaId) => {
    if (pizzas[pizzaId]) {
      pizzas[pizzaId] += 1;
    } else {
      pizzas[pizzaId] = 1;
    }
  });

  const [hour, minute] = order.pickupTime.split(':');
  const pizzaSentences = Object.keys(pizzas).map((pizzaId) => {
    const count = pizzas[pizzaId];
    return `${integerToSpeechText(count)} nummer ${integerToSpeechText(parseInt(pizzaId, 10))} <break time="1s"/>`;
  });
  pizzaSentences.splice(pizzaSentences.length - 1, 0, ' og, ');

  return Polly.synthesizeSpeechAsync({
    OutputFormat: 'mp3',
    Text: `
    <speak>
    Hei<break time="1s"/> Jeg skulle gjerne bestilt ${integerToSpeechText(order.numberOfPizzas)}
    store pizza´er <break time="1s"/> Jeg vil gjerne ha ${pizzaSentences.join(' ')}
    Sett det på ${order.name} <break time="500ms"/> Henter klokken ${integerToSpeechText(parseInt(hour, 10))},
    <break time="300ms"/> ${integerToSpeechText(parseInt(minute, 10))} <break time="1s"/>
    Tast én for å bekrefte bestilling <break time="200ms"/>
    eller <break time="100ms"/> to <break time="100ms"/> for å høre bestillingen igjen.
    <break time="5s"/>
    </speak>
    `,
    TextType: 'ssml',
    VoiceId: 'Liv'
  })
  .then(data => fs.writeFileAsync(path.join(__dirname, '..', EXPRESS_STATIC, 'order.mp3'), data.AudioStream));
};

Polly.synthesizeSpeechAsync({
  OutputFormat: 'mp3',
  Text: `
  <speak>
  Takk, <break time="500ms"/>  bestilling gjennomført. <break time="3s"/>
  </speak>
  `,
  TextType: 'ssml',
  VoiceId: 'Liv'
})
.then(data => fs.writeFileAsync(path.join(__dirname, '..', EXPRESS_STATIC, 'complete.mp3'), data.AudioStream));
