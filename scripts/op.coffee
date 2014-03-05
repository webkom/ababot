# Description:
#   Gives OP-status to everybody in the HUBOT_INTERNAL_USERS-list.
#
# Commands:
#   hubot op - Gives OP-status to everybody in the HUBOT_INTERNAL_USERS-list (#Internal).

module.exports = (robot) ->
  robot.respond /OP$/i, (msg) ->
    robot.adapter.command('MODE', msg.envelope.room, '+o', user) for user in process.env.HUBOT_INTERNAL_USERS.split(",")
