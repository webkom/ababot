# Description:
#   Deploy scripts for ababot 
#
# Commands:
# hubot deploy puppet <node> - deploys master to <node> or all if node is not specified 
# hubot deploy puppet:<branch> <node> - deploys <branch> to <node> or all if node is not specified
# hubot deploy django - deploy nerd to luke

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
]

module.exports = (robot) ->
  robot.respond /deploy puppet(?::(\w+))?(?: (\w+))?/i, (res) ->
    if res.message.user.name in WHITE_LIST
      deploy_puppet(res, res.match[1], res.match[2])
    else
      res.reply "You are not allowed to deploy"

  robot.respond /test puppet(?::(\w+))?(?: (\w+))?/i, (res) ->
    if res.message.user.name in WHITE_LIST
      test_puppet(res, res.match[1], res.match[2])
    else
      res.reply "You are not allowed to do that"


  robot.respond /deploy django(?::(\w+))? *(\w+)?/i, (res) ->
    if res.message.user.name in WHITE_LIST
      deploy_django(res, res.match[1], res.match[2])
    else
      res.reply "You are not allowed to deploy"

do_command = (res, command, success= -> 'Consider it done!') ->
  exec command, (error, stdout, stderr) ->
    res.send error if error
    res.send stderr if stderr

    if stdout
      for line in stdout.split('\n')
        res.send line if line.length > 1

    if !stderr and ! error
      res.reply success()

fab = (res, command, success) ->
  do_command(res, 'fab ' + command + ' --hide=stdout,status,running', success)

deploy_puppet = (res, branch, node) ->
  if node == undefined 
    res.send 'Deploying puppet to all nodes'
    node = 'all'
  else
    res.send 'Deploying puppet to ' + node

  if branch == undefined
    fab(res, 'node:' + node + ' deploy_puppet')
  else
    fab(res, 'node:' + node + ' deploy_puppet:' + branch)

test_puppet = (res, branch, node) ->
  if node == undefined 
    res.send 'Testing puppet on all nodes'
    node = 'all'
  else
    res.send 'Testing puppet on ' + node

  if branch == undefined
    fab(res, 'node:' + node + ' test_puppet')
  else
    fab(res, 'node:' + node + ' test_puppet:' + branch)

deploy_django = (res, branch, node) ->
  node = node or 'luke'
  branch = branch or 'master'

  res.send 'Deploying ' + branch + ' to ' + node + '...'
  fab(res, 'node:' + node + ' deploy_django:nerd,' + branch, ->
    'All done! ' + branch + ' was successfully deployed to ' + node
  )

