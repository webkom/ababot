const { GOOGLE_AUTH } = process.env;

function getServiceAccount() {
  return JSON.parse(GOOGLE_AUTH);
}

module.exports = getServiceAccount;
