const admin = require('firebase-admin');
const getServiceAccount = require('../lib/google');

const serviceAccount = getServiceAccount();
console.log('Acc', serviceAccount);
console.log('Type', typeof serviceAccount);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports.log = function(msg) {
  console.log('Running log on', msg);
  const type = msg.message.text.split(' ')[1];
  const timeInMilli = new Date().getTime().toString();
  const docRef = db.collection(type).doc(timeInMilli);

  docRef.set({
    id: msg.message.id,
    user: msg.message.user.name,
    command: msg.message.text,
    room: msg.message.room
  });
};

const tail = msg => {
  const textArray = msg.message.text.split(' ');

  // Type will alsways be the last argument
  const type = textArray[textArray.length - 1];

  // Calcualte the index of -n flag
  const indexOfN = textArray.indexOf('-n');
  const limit = indexOfN === -1 ? 10 : parseInt(textArray[indexOfN + 1]);

  db.collection(type)
    .limit(limit)
    .get()
    .then(req => {
      req.forEach(doc => {
        const dateInMilli = parseInt(doc.id);
        const dateString = new Date(dateInMilli).toLocaleString('no', {
          hour12: false
        });
        msg.send(dateString, doc.data());
      });
    })
    .catch(err => {
      msg.send('Error getting documents', err);
    });
};

module.exports = robot => {
  robot.respond(/tail (.*)?/i, msg => {
    console.log('Running tail on', msg);
    tail(msg);
  });
};
