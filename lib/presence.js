const fetch = require('node-fetch');

const { PRESENCE_URL } = process.env;

function presence(options = {}) {
  return fetch(PRESENCE_URL, options).then(response => response.json().members);
}

module.exports = presence;
