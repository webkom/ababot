# Description:
#   Show Abakus coffee status
#
# Commands:
# hubot kaffe - returns information about the coffee brewer at the Abakus-office.

moment = require('moment')

module.exports = (robot) ->
  robot.respond /kaffe$/i, (msg) ->
    coffeeStatus msg

coffeeStatus = (msg) ->
  msg.http('http://kaffe.abakus.no/api/status')
    .get() (err, res, body) ->
      json = JSON.parse(body).coffee
      status = if json.status then "på" else "av"
      last = moment(json.last_start, 'YYYY-MM-DD HH:mm', 'nb').fromNow()
      msg.send "Kaffetrakteren er #{status}. Den ble sist skrudd på #{last}."
