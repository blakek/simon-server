import test from 'ava'
import {
  addUser,
  addUserToGroup,
  getUserConnection,
  removeUser,
  users
} from './users'

test('can add users', async t => {
  const conn = { key: 12345, readyState: 1 }
  const testUser = { username: 'blakek', group: 'cool' }

  await addUser(conn, testUser)
  const blakek = users.get('blakek')

  t.true(blakek !== undefined)
  t.true(blakek.groups.has('cool'))
})

test('can add user to group', async t => {
  const conn = { key: 54321, readyState: 1 }
  const testUser = { username: 'kitt3h', group: 'cool' }

  await addUser(conn, testUser)
  await addUserToGroup({ username: 'kitt3h', group: 'cats4life' })
  const kitt3h = users.get('kitt3h')

  t.true(kitt3h.groups.has('cats4life'))
})

test('can get a user\'s connection', async t => {
  const conn = { key: 98237, readyState: 1 }
  const testUser = { username: 'd0gg', group: 'cool' }

  await addUser(conn, testUser)
  const userConn = await getUserConnection({ group: 'cool', username: 'd0gg' })

  t.is(userConn.key, conn.key)
})

test('can remove a user by username', async t => {
  const conn = { key: 28791, readyState: 1 }
  const testUser = { username: 'hax0rz', group: 'cool' }

  await addUser(conn, testUser)
  await removeUser({ username: 'hax0rz' })

  t.false(users.has('hax0rz'))
})

test('can remove a user by connection key', async t => {
  const conn = { key: 98715, readyState: 1 }
  const testUser = { username: 'appleFanBoi', group: 'cool' }

  await addUser(conn, testUser)
  await removeUser({ connection: conn })

  t.false(users.has('appleFanBoi'))
})
