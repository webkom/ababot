# Description:
#   Deploy scripts for ababot
#
# Commands:
# hubot deploy puppet <node> - deploys master to <node> or all if node is not specified
# hubot deploy puppet:<branch> <node> - deploys <branch> to <node> or all if node is not specified
# hubot test puppet:<branch> <node> - tests <branch> on <node> or on all if node is not specified
# hubot deploy (nerd|nit|coffee) - deploy project to luke

exec = require('child_process').exec

WHITE_LIST = [
  'Shell',  # Needed for development
  'rolf',
  'haeric',
  'HansW',
  'EirikSyll',
  'Ek',
  'danseku',
  'kristine',
  'hanse',
  'Xmas'
]

module.exports = (robot) ->
  robot.respond /deploy puppet(:\w+)?(?: (\w+))?/i, (res) ->
    deploy_puppet(res, res.match[1], res.match[2])

  robot.respond /test puppet(:\w+)?(?: (\w+))?/i, (res) ->
    test_puppet(res, res.match[1], res.match[2])

  robot.respond /deploy (nerd|nit|coffee)(?::(\w+))? *(\w+)?/i, (res) ->
    deploy_project(res, res.match[1], res.match[2], res.match[3])

do_command = (res, command, success= -> 'Consider it done!') ->
  if res.message.user.name in WHITE_LIST
    exec command, (error, stdout, stderr) ->
      res.send error if error
      res.send stderr if stderr

      if stdout
        for line in stdout.split('\n')
          res.send line if line.length > 1

      if !stderr and ! error
        res.reply success()
  else
    res.reply "You are not allowed to deploy"

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
