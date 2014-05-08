# Description:
#   Allows hubot to update itself using git pull and npm update.
#   If updates are downloaded you'll need to restart hubot, for example using "hubot die" (restart using a watcher like forever.js).
#
# Dependencies:
#   None
#
# Configuration:
#   None
#
# Commands:
#   hubot update - Performs a git pull and npm udate (#Internal).
#   hubot pending update - Informs if there are pending updates (hubot needs a restart) (#Internal).
#
# Author:
#   benjamine

child_process = require 'child_process'
downloaded_updates = false

is_ops_room = (room) ->
  return room in process.env.HUBOT_INTERNAL_CHANNELS.split(',') or room is 'Shell'

module.exports = (robot) ->

    robot.respond /pending updates?\??$/i, (msg) ->
        if msg.envelope.room in process.env.INTERNAL_CHANNELS.split(",")
            if downloaded_updates
                msg.send "I have some pending updates, KILL ME PLEASE! (hint: !deploybot)"
            else
                msg.send "I'm up-to-date!"

    robot.respond /update( yourself)?$/i, (msg) ->
        if is_ops_room msg.envelope.room
            changes = false
            try
                msg.send "git pull..."
                child_process.exec 'git pull', (error, stdout, stderr) ->
                    if error
                        msg.send "git pull failed: " + stderr
                    else
                        output = stdout+''
                        if not /Already up\-to\-date/.test output
                            msg.send "my source code changed:\n" + output
                            changes = true
                        else
                            msg.send "my source code is up-to-date"
                    try
                        msg.send "npm update..."
                        child_process.exec 'npm update', (error, stdout, stderr) ->
                            if error
                                msg.send "npm update failed: " + stderr
                            else
                                output = stdout+''
                                if /node_modules/.test output
                                    msg.send "some dependencies updated:\n" + output
                                    changes = true
                                else
                                    msg.send "all dependencies are up-to-date"
                            if changes
                                downloaded_updates = true
                                msg.send "I downloaded some updates, KILL ME PLEASE! (hint: !deploybot)"
                            else
                                if downloaded_updates
                                    msg.send "I have some pending updates, KILL ME PLEASE! (hint: !deploybot)"
                                else
                                    msg.send "I'm up-to-date!"
                    catch error
                        msg.send "npm update failed: " + error
            catch error
                msg.send "git pull failed: " + error