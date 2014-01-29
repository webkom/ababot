# Description:
#    Check all abakus projects
#
# Commands:
# hubot are we up - Check all abakus projects

HTTP = require "http"

module.exports = (robot) ->
  robot.respond /are we up/i, (msg) ->
    check 'https://abakus.no', msg
    check 'http://kaffe.abakus.no/', msg
    check 'http://nyitrondheim.no', msg

check = (url, msg) ->
  msg.http(url)
    .get() (err, res, body) ->
      if res.statusCode == 200
        msg.send "Wohoo #{url} is up and running"
      else 
        msg.send "Sound the alarm #{url} returning #{res.statusCode}"
