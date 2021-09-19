const fetch = require('node-fetch');

const { OPENFAAS_URL } = process.env;

function openFaas(functionName, options = {}) {
  return fetch(`${OPENFAAS_URL}/function/${functionName}`, options).then(
    (response) => response.json()
  );
}

module.exports = openFaas;
