# Description:
#   Print messages from Abastat

module.exports = (robot) ->
  robot.router.post "/hubot/abastat", (req, res) ->
    password = req.body.password
    message = req.body.message

    if password
      if password == process.env.ABASTAT_PASSWORD:
        robot.logger.info "Abastat: '#{message}'"
        for channel in process.env.ABASTAT_CHANNELS.split(",")
          robot.messageRoom channel, "Abastat: #{message}"
        res.writeHead 200, {'Content-Type': 'text/plain'}
        res.end 'OK'
      else
        robot.logger.info "Abastat DENIED: '#{message}'"
        res.writeHead 403, {'Content-Type': 'text/plain'}
        res.end 'Forbidden'
