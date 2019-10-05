const admin = require('firebase-admin');
const commandLineArgs = require('command-line-args');
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
  /* Use commandLineArgs to parse the string.
   * This is done by removing the two first words,
   * then sending to the parser, with the definition
   */
  let textArray = msg.message.text.split(' ');
  textArray = textArray.slice(2, textArray.length);
  const optionDefinitions = [
    { name: 'lines', alias: 'n', type: Number },
    { name: 'command', type: String, multiple: true, defaultOption: true }
  ];

  // Get args from flags defined in optionDefinitions
  const options = commandLineArgs(optionDefinitions, { argv: textArray });

  // Default lines to 10, limit lines to 50
  const lines = options.lines ? (options.lines > 50 ? 50 : options.lines) : 10;

  options.command.forEach(command => {
    db.collection(command)
      .orderBy('id', 'desc')
      .limit(lines)
      .get()
      .then(req => {
        let response = '';

        req.forEach(doc => {
          const dateInMilli = parseInt(doc.id);
          const dateString = new Date(dateInMilli).toLocaleString('no', {
            hour12: false
          });

          response += `At: ${dateString}, *${doc.data().user}* said _${
            doc.data().command
          }_ \n`;
        });

        msg.send(response);
      })
      .catch(err => {
        msg.send(err);
      });
  });
};
