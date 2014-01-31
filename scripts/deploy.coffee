# Description:
#   Deploy scripts for ababot
#
# Commands:
# hubot deploy puppet <node> - deploys master to <node> or all if node is not specified (#Internal)
# hubot deploy puppet:<branch> <node> - deploys <branch> to <node> or all if node is not specified (#Internal)
# hubot test puppet:<branch> <node> - tests <branch> on <node> or on all if node is not specified (#Internal)
# hubot deploy (nerd|nit|coffee) - deploy project to luke (#Internal)
# hubot deploybot:<branch> - deploys and restarts ababot (#Internal)

exec = require('child_process').exec

module.exports = (robot) ->
  robot.respond /deploy puppet(:\w+)?(?: (\w+))?/i, (res) ->
    if res.envelope.room == "#webkomops"
      deploy_puppet(res, res.match[1], res.match[2])

  robot.respond /test puppet(:\w+)?(?: (\w+))?/i, (res) ->
    if res.envelope.room == "#webkomops"
      test_puppet(res, res.match[1], res.match[2])

  robot.respond /deploy (nerd|nit|coffee)(?::(\w+))? *(\w+)?/i, (res) ->
    if res.envelope.room == "#webkomops"
      deploy_project(res, res.match[1], res.match[2], res.match[3])

  robot.respond /deploybot(:\w+)?/i, (res) ->
    if res.envelope.room == "#webkomops"
      deploy_bot(res, res.match[1])

do_command = (res, command, success= -> 'Done!') ->
  exec command, (error, stdout, stderr) ->
    res.send error if error
    res.send stderr if stderr

    if stdout
      for line in stdout.split('\n')
        res.send line if line.length > 1

    if !stderr and ! error
      res.reply success()

fab = (res, command, success) ->
  do_command(res, "fab #{command} --hide=stdout,status,running", success)

deploy_puppet = (res, branch, node) ->
  node = node or 'all'
  branch = branch or ''
  res.send "Deploying puppet to #{node}"

  fab(res, "node:#{node} deploy_puppet#{branch}")

test_puppet = (res, branch, node) ->
  node = node or 'all'
  branch = branch or ''
  res.send "Testing puppet on #{node}"

  fab(res, "node:#{node} test_puppet#{branch}")

deploy_project = (res, project, branch, node) ->
  node = node or 'luke'
  branch = branch or 'master'

  res.send "Deploying #{project}:#{branch} to #{node}..."
  fab(res, "node:#{node} deploy_project:#{project},#{branch}", ->
    "All done! #{branch} was successfully deployed to #{node}"
  )

deploy_bot = (res, branch) ->
  branch = branch or "master"
  res.send "Restarting and deploying ababot, branch: #{branch}..."
  fab(res, "node:yoda deploy_bot:#{branch}", ->
    "All done! Ababot deployed. "
  )
