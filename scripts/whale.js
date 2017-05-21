// Description:
//
// Configuration:
//   WHALE_API_URL,
//   WHALE_ACCESS_KEY_ID,
//   WHALE_ACCESS_KEY_SECRET
// Commands
//   hubot whale list releases - List releases managed by Whale
//   hubot whale list deployments <release_name>-<release_environment> - List deployments of a release

//   hubot whale list release-values <release_name>-<release_environment> - List the secrets stored for a release
//   hubot whale remove release-value <secret_id> - Remove a secret from a release
//   hubot whale add release-value <release_name>-<release_environment> <secret_name> <secret_value> - Add a secret to a release

const fetch = require('node-fetch');

const {
  WHALE_API_URL,
  WHALE_ACCESS_KEY_ID,
  WHALE_ACCESS_KEY_SECRET
} = process.env;

function whale(path, options = {}) {
  const auth = 'Basic ' + new Buffer(`${WHALE_ACCESS_KEY_ID}:${WHALE_ACCESS_KEY_SECRET}`).toString('base64');
  return fetch(`${WHALE_API_URL}${path}`, Object.assign({
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json'
    }
  }, options));
}

function getReleaseID(releaseName) {
  return whale('/releases')
  .then((response) => {
    if (response.status !== 200) {
      throw new Error(`Could not load data from Whale (${response.status}).`);
    }
    return response.json();
  })
  .then((releases) => {
    for (var i = 0; i < releases.results.length; i++) {
      const release = releases.results[i];
      if (`${release.name}-${release.environment}` === releaseName) {
        return release.id;
      }
    }
    throw new Error('Could not find the release!');
  })
}

function parseReleases(payload) {
    const releases = payload.results;
    return 'Releases: \n\n' + (releases
    .map((release) => (
      `${release.name}-${release.environment} (${release.owner}) ${release.description}`
    ))
    .join('\n'));
};

function parseDeployments(payload) {
  const deployments = payload.results;
  return 'Deployments: \n\n' + (deployments
  .map((deployment) => (
    `[${deployment.status}] ${deployment.createdAt}`
  ))
  .join('\n')
  );
};

function parseReleaseValues(payload) {
  const releaseValues = payload.results;
  return 'Release Secrets: \n\n' + (releaseValues
  .map((value) => (
    `(${value.id}) ${value.name}`
  ))
  .join('\n')
  );
}

module.exports = (robot) => {

  robot.respond(/whale list releases/i, (msg) => {
    const send = msg.send.bind(msg);

    whale('/releases')
    .then((response) => {
      if (response.status !== 200) {
        throw new Error(`Could not load data from Whale (${response.status}).`);
      }
      return response.json();
    })
    .then(parseReleases)
    .then(send)
    .catch((error) => send(error.message));
  });

  robot.respond(/whale list deployments (.*)/i, (msg) => {
    const send = msg.send.bind(msg);
    const releaseName = msg.match[1].trim();

    getReleaseID(releaseName)
    .then((releaseID) => {
      return whale(`/deployments?release=${releaseID}&page_size=5`)
      .then((response) => {
        if (response.status !== 200) {
          throw new Error(`Could not load data from Whale (${response.status}).`);
        }
        return response.json();
      })
    })
    .then(parseDeployments)
    .then(send)
    .catch((error) => send(error.message));
  });

  robot.respond(/whale list release-values (.*)/i, (msg) => {
    const send = msg.send.bind(msg);
    const releaseName = msg.match[1].trim();

    getReleaseID(releaseName)
    .then((releaseID) => {
      return whale(`/release-values?release=${releaseID}`)
      .then((response) => {
        if (response.status !== 200) {
          throw new Error(`Could not load data from Whale (${response.status}).`);
        }
        return response.json();
      })
    })
    .then(parseReleaseValues)
    .then(send)
    .catch((error) => send(error.message));
  });

  robot.respond(/whale remove release-value (.*)/i, (msg) => {
    const send = msg.send.bind(msg);
    const releaseValueId = msg.match[1].trim();
    return whale(`/release-values/${releaseValueId}`, { method: 'DELETE' })
    .then((response) => {
      if (response.status !== 204) {
        throw new Error(`Could not load data from Whale (${response.status}).`);
      }
      return response.json();
    })
    .then(() => send('Release value removed!'))
    .catch((error) => send(error.message));
  });

  robot.respond(/whale add release-value ([a-z0-9]([-a-z0-9]*[a-z0-9])?)? (\S+) (.*)/i, (msg) => {
    const send = msg.send.bind(msg);
    const releaseName = msg.match[1].trim();
    const releaseValueName = msg.match[3].trim();
    const releaseValueValue = msg.match[4].trim();
    getReleaseID(releaseName)
    .then((releaseID) => {
      return whale(`/release-values`, {
        method: 'POST',
        body: JSON.stringify({
          release: releaseID,
          name: releaseValueName,
          value: releaseValueValue
        })
      })
      .then((response) => {
        if (response.status !== 201) {
          throw new Error(`Could not load data from Whale (${response.status}).`);
        }
        return response.json();
      })
    })
    .then(() => send('Value created!'))
    .catch((error) => send(error.message));
  });

};
