const wsServer = require('json-websocket-server')()
const { addUser, getUserConnection, removeUser } = require('./users')

wsServer.on('join', handleUserJoin)
wsServer.on('part', handleUserLeave)
wsServer.on('send', handleSayMessage)
wsServer.on('yell', handleBroadcastMessage)
wsServer.on('disconnect', handleUserLeave)

function handleBroadcastMessage(connection, userMessage) {
  connection.send('not-yet-implemented')
}

function handleSayMessage(connection, userMessage) {
  sayStuff(userMessage)
    .then(() => connection.send('sent'))
    .catch(error => {
      const reason = error.message
      connection.send('user-leave-error', { error, reason })
    })
}

function handleUserJoin(connection, groupUser) {
  addUser(connection, groupUser)
    .then(() => {
      connection.send('joined', groupUser)
    })
    .catch(error => {
      const reason = error.message
      connection.send('user-add-error', { error, reason })
    })
}

function handleUserLeave(connection, groupUser) {
  removeUser({ connection, groupUser })
    .then(() => {
      connection.send('left', groupUser)
    })
    .catch(error => {
      const reason = error.message
      connection.send('user-leave-error', { error, reason })
    })
    .catch(() => { /* don't throw errors from trying to write to closed connection */ })
}

function sayStuff({ to, from, text }) {
  return getUserConnection({ group: to.group, username: to.username })
    .then(destination => {
      destination.send('say', { to, from, text })
    })
}
