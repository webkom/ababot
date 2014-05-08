# Description:
#   Deploy scripts for ababot
#
# Commands:
# hubot deploy puppet <node> - deploys master to <node> or all if node is not specified (#Internal)
# hubot deploy puppet:<branch> <node> - deploys <branch> to <node> or all if node is not specified (#Internal)
# hubot test puppet:<branch> <node> - tests <branch> on <node> or on all if node is not specified (#Internal)
# hubot deploy (nerd|nit|coffee) - deploy project to luke (#Internal)
# hubot deploybot:<branch> - deploys and restarts ababot (#Internal)

spawn = require('child_process').spawn

node_apps = ['nit']

is_ops_room = (room) ->
  return room in process.env.HUBOT_INTERNAL_CHANNELS.split(',') or room is 'Shell'

module.exports = (robot) ->
  robot.respond /deploy puppet(:\w+)?(?: (\w+))?/i, (res) ->
    if is_ops_room res.envelope.room
      deploy_puppet(res, res.match[1], res.match[2])

  robot.respond /test puppet(:\w+)?(?: (\w+))?/i, (res) ->
    if is_ops_room res.envelope.room
      test_puppet(res, res.match[1], res.match[2])

  robot.respond /deploy (nerd|nit|coffee)(?::(\w+))? *(\w+)?/i, (res) ->
    if is_ops_room res.envelope.room
      if (node_apps.indexOf res.match[1] != -1)
        deploy_node res, res.match[1], res.match[2], res.match[3]
      else
        deploy_project(res, res.match[1], res.match[2], res.match[3])

  robot.respond /deploybot(:\w+)?/i, (res) ->
    if is_ops_room res.envelope.room
      deploy_bot(res, res.match[1])

fab = (res, args, success = 'Consider it done!', error = 'Sorry! I could not do what you asked of me') ->
  fabric = spawn('fab', args)
  failed = false
  fabric.stderr.on 'data', (data) -> 
    res.send data
    failed = true

  fabric.stdout.on 'data', (data) -> 
    if /Error:/.test(data)
      message = data.toString().match /(Error: .*)/
      res.send message[0]
      failed = true
    else if /librarian-puppet install/.test(data)
      res.send 'Running librarian install'
    else if /HEAD is now at/.test(data)
      status = data.toString().match /(HEAD is now at [a-zA-Z0-9]+)/
      res.send status[0] 
    if /puppet apply/.test(data)
      node = data.toString().match(/\[([a-z0-9]+)\./)[1]
      res.send "Running puppet apply on #{node}"

  fabric.on 'close', (code) ->
    if code == 0 and not failed
      res.send success
    else
      res.send error 

deploy_puppet = (res, branch, node) ->
  node = node or 'all'
  branch = branch or ''
  res.send "Deploying puppet to #{node}"

  fab(res, ["node:#{node}", "deploy_puppet#{branch}"])

test_puppet = (res, branch, node) ->
  node = node or 'all'
  branch = branch or ''
  res.send "Testing puppet on #{node}"

  fab(res, ["node:#{node}", "test_puppet#{branch}"], 'Test failed...')

deploy_project = (res, project, branch, node) ->
  node = node or 'luke'
  branch = branch or 'master'

  res.send "Deploying #{project}:#{branch} to #{node}..."
  fab(res, ["node:#{node}", "deploy_project:#{project},#{branch}"],
    "All done! #{branch} was successfully deployed to #{node}"
  )

deploy_bot = (res, branch) ->
  branch = branch or "master"
  res.send "Restarting and deploying ababot, branch: #{branch}..."
  fab(res, ["node:yoda",  "deploy_bot:#{branch}"], "All done! Ababot deployed.")

deploy_node = (res, project, branch, node) ->
  node = node or 'luke'
  project = project or 'nit'
  branch = branch or 'master'
  res.send "Deploying node project #{project} to #{node}"

  fab res, ["node:#{node}", "deploy_node:#{project},#{branch}"]
