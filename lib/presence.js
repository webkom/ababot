const admin = require('firebase-admin');

const {
  G_PROJECT_ID,
  G_PRIVATE_KEY,
  G_PRIVATE_KEY_ID,
  G_CLIENT_EMAIL,
  G_CLIENT_ID,
  G_CLIENT_X509_CERT_URL
} = process.env;

admin.initializeApp({
  credential: admin.credential.cert({
    type: 'service_account',
    projectId: G_PROJECT_ID,
    privateKeyId: G_PRIVATE_KEY_ID,
    privateKey: G_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/\\ /g, ' '),
    clientEmail: G_CLIENT_EMAIL,
    clientId: G_CLIENT_ID,
    authUri: 'https://accounts.google.com/o/oauth2/auth',
    tokenUri: 'https://oauth2.googleapis.com/token',
    authProviderX509CertUrl: 'https://www.googleapis.com/oauth2/v1/certs',
    clientX509CertUrl: G_CLIENT_X509_CERT_URL
  })
});

const firestore = admin.firestore();
firestore.settings({ timestampsInSnapshots: true });

function get_presence_device(mac_address) {
  return firestore
    .collection('devices')
    .doc(mac_address)
    .get()
    .then(presence_device => presence_device.data());
}

module.exports = get_presence_device;
