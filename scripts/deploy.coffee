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

  robot.respond /deploy project (\w+)( \w+)?/i, (res) ->
    if res.message.user.name in WHITE_LIST
      deploy(res, res.match[1])
    else
      res.reply "You are not allowed to deploy"

do_command = (res, command) ->
  @exec = require('child_process').exec

  @exec command, (error, stdout, stderr) ->
    res.send "doing " + command
    res.send error if error
    res.send stderr if stderr
    #res.send stdout if stdout

    if !stderr or ! error
      res.reply 'Consider it done!'

deploy_puppet = (res, branch, node) ->
  if node == undefined 
    res.send 'Deploying puppet to all nodes'
    node = 'all'
  else
    res.send 'Deploying puppet to ' + node

  if branch == undefined
    do_command(res, 'fab node:' + node + ' deploy')
  else
    do_command(res, 'fab node:' + node + ' deploy:' + branch)
  
deploy = (res, project) ->
  #FIXME, Implement this
  res.send "Not implemented yet"

