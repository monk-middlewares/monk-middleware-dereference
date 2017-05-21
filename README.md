monk-middleware-dereference
=============

Monk middleware to handle dereferences

```bash
npm install --save monk-middleware-dereference
```

## Usage

Let's imagine that the `todos` reference a user _id in their `author` field:

```js
db.addMiddleware(require('monk-middleware-dereference'))

const todos = db.get('todos', {
	refMapping: {
		author: 'users'
	}
})

todos.find({}, {
	dereference: {
		author: true // get everything from the user
	}
})

todos.find({}, {
	dereference: {
		author: 'username' // only get the username from the user
	}
})
```

## License

  MIT
