const fetch = require('node-fetch');

const { OFFICE_DOOR_URL } = process.env;

function officeDoor(options = {}) {
  return fetch(OFFICE_DOOR_URL, options).then(response => response.json());
}

module.exports = officeDoor;
