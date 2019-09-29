const admin = require('firebase-admin');
const getServiceAccount = require('../lib/google');

const serviceAccount = getServiceAccount();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports.log = function(msg) {
  const type = msg.message.text.split(' ')[1];
  const timeInMilli = new Date().getTime().toString();
  const docRef = db.collection(type).doc(timeInMilli);

  docRef.set({
    id: parseInt(timeInMilli),
    user: msg.message.user.name,
    command: msg.message.text,
    room: msg.message.room
  });
};

module.exports.tail = function(msg) {
  const textArray = msg.message.text.split(' ');

  // Type will alsways be the last argument
  const type = textArray[textArray.length - 1];

  // Calcualte the index of -n flag
  const indexOfN = textArray.indexOf('-n');
  const limit = indexOfN === -1 ? 10 : parseInt(textArray[indexOfN + 1]);

  db.collection(type)
    .orderBy('id', 'desc')
    .limit(limit)
    .get()
    .then(req => {
      let response = '';

      req.forEach(doc => {
        const dateInMilli = parseInt(doc.id);
        const dateString = new Date(dateInMilli).toLocaleString('no', {
          hour12: false
        });

        response += `At: ${dateString}, [${doc.data().user}] said [${
          doc.data().command
        }] in room [${doc.data().room}] \n`;
      });

      msg.send(response);
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
};
