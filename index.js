const port = process.env.PORT || 3000
const io = require('socket.io')(port)

const messages = {
  duplicateUsername: 'Username already being used; please choose another username.',
  invalidGroupName: 'A valid group name is needed.',
  invalidUsername: 'A valid username is needed.',
  noUser: 'Could not find username for that group.'
}

const handleJoin = (socket) => ({ group = '', username = '' }) => {
  if (!isValidName(group)) {
    return socket.emit('simon-error', 'join', messages.invalidGroupName)
  }

  if (!isValidName(username)) {
    return socket.emit('simon-error', 'join', messages.invalidUsername)
  }

  const groupUsers = getGroupUsers({ group, socket })

  if (groupUsers.includes(username)) {
    return socket.emit('simon-error', 'join', messages.duplicateUsername)
  }

  socket.username = username
  socket.join(group)

  socket.emit('joined', { group, username })
}

const handleList = (socket) => ({ group = '' }) => {
  const users = getGroupUsers({ group, socket })
  socket.emit('users', { group, users })
}

const handlePart = (socket) => ({ group = '', username = '' }) => {
  socket.leave(group)
}

const handleSend = (socket) => ({ to = { group: '', username: '' }, text = '' }) => {
  const { group, username } = to
  const sendNotFound = () => socket.emit('simon-error', 'recipient-not-found', messages.noUser)
  const groupSockets = getGroupConnections({ group, socket })

  if (!groupSockets) {
    return sendNotFound()
  }

  const toUser = groupSockets.find(socketId => io.sockets.connected[socketId].username === username)

  if (!toUser) {
    return sendNotFound()
  }

  socket.to(toUser).emit('say', { text: text })
}

const handleYell = (socket) => ({ to = { group: '' }, text = '' }) => {
  const groups = Object.keys(socket.adapter.rooms)

  if (groups.includes(to.group)) {
    return socket.to(to.group).emit('say', { text: text })
  }

  socket.emit('simon-error', 'recipient-not-found', messages.noUser)
}

function getGroupConnections({ group = '', socket }) {
  const room = socket.adapter.rooms[group]

  if (typeof room !== 'object' || room.sockets == null) {
    return
  }

  return Object.keys(room.sockets)
}

function getGroupUsers({ group = '', socket }) {
  const groupSockets = getGroupConnections({ group, socket })

  if (!groupSockets) {
    return []
  }

  return groupSockets.map(socketId => io.sockets.connected[socketId].username)
}

function isValidName(name) {
  return typeof name === 'string' && name.length > 0
}

io.on('connection', socket => {
  socket.on('join', handleJoin(socket))
  socket.on('list', handleList(socket))
  socket.on('part', handlePart(socket))
  socket.on('send', handleSend(socket))
  socket.on('yell', handleYell(socket))
})

console.log(`starting on port ${port}`)
