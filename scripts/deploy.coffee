exec = require('child_process').exec

WHITE_LIST = [
  'Shell',  # Needed for development 
  'rolf',
  'haeric',
]

module.exports = (robot) ->
  robot.respond /deploy puppet(:\w+)?( \w+)?/i, (res) ->
    if res.message.user.name in WHITE_LIST
      deploy_puppet(res, res.match[1], res.match[2].replace(' ', ''))
    else
      res.reply "You are not allowed to deploy"

  robot.respond /deploy django(?::(\w+))? *(\w+)?/i, (res) ->
    if res.message.user.name in WHITE_LIST
      deploy_django(res, res.match[1], res.match[2])
    else
      res.reply "You are not allowed to deploy"

do_command = (res, command, success= -> 'Consider it done!') ->
  exec command, (error, stdout, stderr) ->
    #res.send "doing " + command
    res.send error if error
    res.send stderr if stderr
    #res.send stdout if stdout

    if !stderr and ! error
      res.reply success()

deploy_puppet = (res, branch, node) ->
  if node == undefined 
    res.send 'Deploying puppet to all nodes'
    node = 'all'
  else
    res.send 'Deploying puppet to ' + node

  if branch == undefined
    do_command(res, 'fab node:' + node + ' deploy_puppet')
  else
    do_command(res, 'fab node:' + node + ' deploy_puppet:' + branch)
  
deploy_django = (res, branch, node) ->
  node = node or 'luke'
  branch = branch or 'master'

  res.send 'Deploying ' + branch + ' to ' + node + '...'
  do_command(res, 'fab node:' + node + ' deploy_django:nerd,' + branch, ->
    'All done! ' + branch + ' was successfully deployed to ' + node
  )

