const https = require('https');

const parse = function(msg) {
  return JSON.stringify({
    user: msg.message.user.name,
    command: msg
  });
};
const options = {
  hostname: 'https://hubot-logs.firebaseio.com/',
  port: 443,
  path: '/logs.json',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {});

exports.log = function(msg) {
  const body = parse(msg);
  req.write(body);
  req.end();
};
