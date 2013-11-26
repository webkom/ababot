# Description:
#   Show Abakus coffee status
#
module.exports = (robot) ->
  robot.respond /coffee status$/i, (msg) ->
    coffeeStatus msg

coffeeStatus = (msg) ->
  msg.http('http://kaffe.abakus.no/api/status')
    .get() (err, res, body) ->
      json = JSON.parse(body)
      status = if json['status'] then "on" else "off"
      msg.send "The Moccamaster is #{status}. It was started at #{json['last_start']}."
