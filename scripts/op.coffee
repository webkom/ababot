# Description:
#   Gives OP-status to everybody in the HUBOT_INTERNAL_USERS-list.
#
# Commands:
#   hubot op - Gives OP-status to everybody in the HUBOT_INTERNAL_USERS-list (#Internal).

is_ops_room = (room) ->
  return room in process.env.HUBOT_INTERNAL_CHANNELS.split(',') or room is 'Shell'

module.exports = (robot) ->
  robot.respond /OP$/i, (msg) ->
    if is_ops_room msg.envelope.room
      robot.adapter.command('MODE', msg.envelope.room, '+o', user) for user in process.env.HUBOT_INTERNAL_USERS.split(",")
