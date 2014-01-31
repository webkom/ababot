# Description:
#   Update the public Ababot scripts. 
#
# Commands:
# hubot updatescripts - updates ababot with the latest public scripts from the public repo: PUTREPOURLHERE (#Internal)

exec = require('child_process').exec

module.exports = (robot) ->
	robot.respond /updatescripts/i, (msg) ->
    if msg.envelope.room == "#webkomops"
      msg.send("Publishing NPM-package.")
      do_command "fab node:yoda update_scripts --hide=stdout,status,running", (err, message) ->
        return msg.send err if err
        msg.send message
        msg.send "NPM package succesfully published."
        do_command "npm update ababot-scripts", (err2, message2) ->
          return msg.send err2 if err2
          msg.send message2
          msg.send "Scripts successfully updated (npm update complete)."

do_command = (command, fn) ->
  exec command, (err, stdout, stderr) ->
    return fn(err) if err
    data = ""
    if stdout
      for line in stdout.split('\n')
        data += "#{line}\n" if line.length > 1
    fn(null, data + stderr)
