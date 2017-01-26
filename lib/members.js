const fetch = require('node-fetch');

const {
  MEMBERS_URL
} = process.env;

function members(path = '', options = {}) {
  return fetch(`${MEMBERS_URL}${path}`, options)
    .then((response) => response.json());
}

module.exports = members;
