// Description:
//   Control the TV (via Chromecast)
// Configuration:
//   OPENFAAS_URL,
// Commands
//   hubot tv pause - Pause whatever is playing on the TV
//   hubot tv play - Start playing (again)
//   hubot tv mute - Mute the TV
//   hubot tv unmute - Unmute the TV
//   hubot tv next - Play the next item (song/video) in the list
//   hubot tv previous - Play the previous item (song/video) in the list
//   hubot tv <url|youtube_url> - If URL is a Youtube Video, play the video, else Cast the URL to the Chromecast
//   hubot tv 0-100 - Change the volume of the TV (0% to 100%)

const _ = require('lodash');
const fetch = require('node-fetch');
const openFaas = require('../lib/openfaas');
const logger = require('./log');

// Django regex for URLs
const regexUrlCommand = /tv (.*(?:http|ftp)s?:\/\/(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/?]\S+).*)/i;
const regexYoutube = /.*(youtu.be\/|youtube(-nocookie)?.com\/(v\/|.*u\/\w\/|embed\/|.*v=))([\w-]{11}).*/i;

function sendCommand(command, additional = {}) {
  const payload = { ...additional, command };
  return openFaas('office-chromecast-api', {
    method: 'POST',
    body: JSON.stringify(payload)
  }).then(response => {
    return;
  });
}

module.exports = robot => {
  robot.respond(/tv pause/i, msg => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    sendCommand('pause').catch(error => send(error.message));
    robot.adapter.client.web.reactions.add('double_vertical_bar', {
      channel: msg.message.room,
      timestamp: msg.message.id
    });
  });
  robot.respond(/tv play/i, msg => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    sendCommand('play').catch(error => send(error.message));
    robot.adapter.client.web.reactions.add('arrow_forward', {
      channel: msg.message.room,
      timestamp: msg.message.id
    });
  });
  robot.respond(/tv mute/i, msg => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    sendCommand('mute').catch(error => send(error.message));
    robot.adapter.client.web.reactions.add('mute', {
      channel: msg.message.room,
      timestamp: msg.message.id
    });
  });
  robot.respond(/tv unmute/i, msg => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    sendCommand('unmute').catch(error => send(error.message));
    robot.adapter.client.web.reactions.add('speaker', {
      channel: msg.message.room,
      timestamp: msg.message.id
    });
  });
  robot.respond(/tv next/i, msg => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    sendCommand('next').catch(error => send(error.message));
    robot.adapter.client.web.reactions.add(
      'black_right_pointing_double_triangle_with_vertical_bar',
      {
        channel: msg.message.room,
        timestamp: msg.message.id
      }
    );
  });
  robot.respond(/tv previous/i, msg => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    sendCommand('previous').catch(error => send(error.message));
    robot.adapter.client.web.reactions.add(
      'black_left_pointing_double_triangle_with_vertical_bar',
      {
        channel: msg.message.room,
        timestamp: msg.message.id
      }
    );
  });
  robot.respond(regexUrlCommand, msg => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    if (msg.match[1] === undefined) {
      return;
    }
    const url = msg.match[1].trim();
    const youtubeMatch = url.match(regexYoutube);
    let command = 'cast';
    // Check if the URL is a YouTube URL
    if (youtubeMatch !== null) {
      const video_id = youtubeMatch[4];
      // Check if the YouTube is in fact a Video, ignore it otherwise
      if (video_id === undefined || video_id.trim() === '') {
        // Maybe cast it as a normal website instead of ignoring?
        return;
      }
      command = 'youtube';
    }
    sendCommand(command, {
      url
    })
      .catch(error => send(error.message))
      .then(_ => {
        robot.adapter.client.web.reactions.add('tv', {
          channel: msg.message.room,
          timestamp: msg.message.id
        });
      });
  });
  robot.respond(/tv (\d{0,3})/i, msg => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    if (msg.match[1] === undefined) {
      return;
    }
    let volume = msg.match[1].trim();
    let parsedVolume = parseInt(volume);
    if (isNaN(parsedVolume)) {
      // Ignore the int as it's not a number
      return;
    }
    if (parsedVolume > 100) {
      parsedVolume = 100;
    } else if (parsedVolume < 0) {
      parsedVolume = 0;
    }
    sendCommand('set_volume', {
      volume: parsedVolume
    })
      .catch(error => send(error.message))
      .then(_ => {
        let emoji = 'speaker';
        if (parsedVolume >= 50) {
          emoji = 'loud_sound';
        } else if (parsedVolume > 0) {
          emoji = 'sound';
        }
        robot.adapter.client.web.reactions.add(emoji, {
          channel: msg.message.room,
          timestamp: msg.message.id
        });
      });
  });
};
