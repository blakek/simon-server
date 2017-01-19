const users = new Map()

const messages = {
  duplicateUsername: 'Username already being used; please choose another username.',
  invalidGroupName: 'A valid group name is needed.',
  invalidUsername: 'A valid username is needed.',
  noUser: 'Could not find username for that group.'
}

function addUser(connection, { group, username }) {
  return new Promise((resolve, reject) => {
    if (!isValidName(username)) {
      reject(new Error(messages.invalidUsername))
    }

    if (!isValidName(group)) {
      reject(new Error(messages.invalidGroupName))
    }

    if (users.has(username)) {
      reject(new Error(messages.duplicateUsername))
    }

    users.set(username, {
      connectionKey: connection.key,
      connection,
      groups: new Set([group])
    })

    resolve()
  })
}

function addUserToGroup({ group, username }) {
  return new Promise((resolve, reject) => {
    const user = users.get(username)

    // No user found with username
    if (user === undefined) {
      return reject(new Error(messages.noUser))
    }

    user.groups.add(group)

    resolve()
  })
}

function findUserWithKey(connectionKey) {
  return ([username, userInfo]) => userInfo.connection.key === connectionKey
}

function getUserConnection({ group, username }) {
  return new Promise((resolve, reject) => {
    const user = users.get(username)

    // No user found with username
    if (user === undefined) {
      return reject(new Error(messages.noUser))
    }

    // Not found in group
    if (!user.groups.has(group)) {
      return reject(new Error(messages.noUser))
    }

    const connection = user.connection

    // No username found or no user connection found
    if (connection === undefined || connection.readyState == null) {
      return reject(new Error(messages.noUser))
    }

    resolve(connection)
  })
}

function isValidName(name) {
  return typeof name === 'string' && name.length > 0
}

function removeUser({ connection, username }) {
  return new Promise((resolve, reject) => {
    if (isValidName(username)) {
      users.delete(username)
      return resolve()
    }

    if (typeof connection === 'object' && connection.key != null) {
      [...users].filter(findUserWithKey(connection.key)).map(userEntry => {
        if (userEntry === undefined) {
          return reject(new Error(messages.noUser))
        }

        users.delete(userEntry[0])
      })

      return resolve()
    }

    reject(new Error(messages.noUser))
  })
}

module.exports = {
  addUser,
  addUserToGroup,
  getUserConnection,
  removeUser,
  users
}
