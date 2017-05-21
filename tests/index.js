import test from 'ava'
import monk from 'monk'
import middleware from '../src/'

const db = monk('127.0.0.1/monk-dereferences')
db.addMiddleware(middleware())
const todoCollectionName = 'todos-' + Date.now()
const users = db.get('users-' + Date.now(), {
  refMapping: {
    todo: todoCollectionName
  }
})
const todos = db.get(todoCollectionName)

test.before(() => {
  return todos.insert([{text: 'a'}, {text: 'b'}]).then((res) => {
    return users.insert([{username: 'a', todo: res[0]._id}, {username: 'b', todo: res[1]._id}])
  })
})

test.after(() => {
  return Promise.all([users.drop(), todos.drop()])
})

test('should not do anything if no dereference option', (t) => {
  return users.find().then((res) => {
    t.is(typeof res[0].todo.toHexString(), 'string')
  })
})

test('should dereference option with findOne', (t) => {
  return users.findOne({}, {
    dereference: { todo: true }
  }).then((res) => {
    t.is(typeof res.todo._id.toHexString(), 'string')
    t.is(typeof res.todo.text, 'string')
  })
})

test('should dereference option with findOne', (t) => {
  return users.findOne({}, {
    dereference: { todo: '_id' }
  }).then((res) => {
    t.is(typeof res.todo._id.toHexString(), 'string')
    t.falsy(res.todo.text)
  })
})

test('should dereference option with find', (t) => {
  return users.find({}, {
    dereference: { todo: true }
  }).then((res) => {
    t.is(typeof res[0].todo._id.toHexString(), 'string')
    t.is(typeof res[0].todo.text, 'string')
  })
})
