require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');

const cors = require('./middleware/cors');
const db = require('./middleware/helpers');
const auth = require('./middleware/authenticate');
const { getUserInfo } = require('./middleware/helpers');
const server = express();
const port = process.env.PORT || 5000;

// variables used to track authorization to information
let activeUser = 0;
let infoUser = 0;
let sharing = false;

// TODO maybe consider cleaning up this and other "helper" function code here to another file
const catchPhrase = (err, res) => {
  // response - typical server error
  res.status(500).send(err);
};

const pullBooks = (id, res) => {
  db.getBookList(id)
    .then((books) => {
      // response - all is good
      res.status(201).json(books);
    })
    .catch((err) => catchPhrase(err, res));
};

// response - sharing is not turned on or user is otherwise not authorized
const notAuthorized = (res) => {
  res.status(403).send('You are not authorized to this info');
};

server.use(express.json(), cors);

// --------------------------------------------
//          -- GET --

server.get('/', (req, res) => {
  res.status(200).send('Hello World');
});

// get active user
// return userinfo (colors) if either auth or guest
server.get('/user/:id', auth.protected, (req, res) => {
  infoUser = req.params.id;
  activeUser = req.userID;
  db.getUserInfo(infoUser)
    .then((user) => {
      const authUser = user;
      // checking to make sure the user searched for exists
      if (authUser != undefined) {
        authUser.auth = activeUser == infoUser ? true : false;
        authUser.sharing = authUser.sharing ? true : false;
        // allows access to info if authorized user or info is shared
        if (authUser.auth || authUser.sharing) {
          // response - all is good
          sharing = true;
          res.json(authUser);
        } else {
          // response - no authorization or sharing
          sharing = false;
          notAuthorized(res);
        }
      } else {
        // response - no user found
        res.status(404).send('This user cannot be found');
      }
    })
    .catch((err) => catchPhrase(err, res));
});

// list of books
// return array of books if either auth or guest
// TODO this seems out of place and should be rewritten using pullBooks()
server.get('/user/:id/books', (req, res) => {
  const id = req.params.id;
  db.getBookList(id)
    .then((books) => {
      // checking for authorization
      if (sharing && id == infoUser) {
        if (books.length > 0) {
          // response - all is good
          res.json(books);
        } else {
          // response - info user has no book list
          res.status(404).send('No books found');
        }
      } else {
        notAuthorized(res);
      }
    })
    .catch((err) => catchPhrase(err, res));
});

// one book info
// return book object
// .get('/user/:id/books/:isbn')

// share status of user id
// .get('/user/:id/status')

//get all users
server.get('/admin', (req, res) => {
  db.getAllUsers().then(users => {
    res.json(users)
  }).catch(err => catchPhrase(err, res))
})

// -------------------------------------------------
//          -- POST --

// register
server.post('/user/register', (req, res) => {
  const creds = req.body;
  creds.password = bcrypt.hashSync(creds.password, 12);
  db.addUser(creds)
    .then((ids) => {
      const id = ids[0];
      db.getUserInfo(id)
        .then((user) => {
          activeUser = user.id;
          const token = auth.generateToken(activeUser);
          res.status(201).json({ id: activeUser, token, message: 'hello' });
        })
        .catch((err) => res.status(500).send(err));
    })
    .catch((err) => catchPhrase(err, res));
});

// login
server.post('/user/login', (req, res) => {
  const creds = req.body;
  db.login(creds)
    .then((user) => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        activeUser = user.id;
        const token = auth.generateToken(activeUser);
        res.json({
          message: `Welcome user#${activeUser}`,
          token,
          id: activeUser,
        });
      } else {
        res.status(401).send('Shove off, faker!');
      }
    })
    .catch((err) => catchPhrase(err, res));
});

// add a book
server.post('/user/:id/books', (req, res) => {
  const id = req.params.id;
  const book = req.body.book;
  if (id == infoUser && id == activeUser) {
    db.addBook(book, activeUser)
      .then(() => pullBooks(id, res))
      .catch((err) => catchPhrase(err, res));
  } else {
    notAuthorized(res);
  }
});

// ------------------------------------------------
//           -- PUT --

// change password
server.put('/user/:id', (req, res) => {
  const id = req.params.id;
  const { currPassword, newPassword } = req.body;
  console.log(id, infoUser, activeUser);
  if (id == infoUser && id == activeUser) {
    db.checkPassword(id)
      .then((user) => {
        if (user && bcrypt.compareSync(currPassword, user.password)) {
          newUser = { ...user };
          newUser.password = bcrypt.hashSync(newPassword, 12);
          db.editItem(id, newUser, 'users').then().catch();
        }
      })
      .catch((err) => catchPhrase(err, res));
  } else {
    notAuthorized(res);
  }
});

// change a book description
server.put('/users/:id/books/:book_id', (req, res) => {
  const { id, book_id } = req.params;
  const { book } = req.body;
  if (id == infoUser && id == activeUser) {
    db.editItem(book_id, book, 'books')
      .then(() => pullBooks(id, res))
      .catch((err) => catchPhrase(err, res));
  } else {
    notAuthorized(res);
  }
});

// change school colors
server.post('/user/:id/color', (req, res) => {
  const { id } = req.params;
  const { color1r, color1g, color1b, color2r, color2g, color2b } = req.body;
  if (id == infoUser && id == activeUser) {
    db.checkPassword(id)
      .then((user) => {
        newUser = {
          ...user,
          color1r,
          color1g,
          color1b,
          color2r,
          color2g,
          color2b,
        };
        db.editItem(id, newUser, 'users')
          .then(() => {
            res.json(newUser);
          })
          .catch((err) => catchPhrase(err, res));
      })
      .catch((err) => catchPhrase(err, res));
  } else {
    notAuthorized(res);
  }
});

// change share status
// .put('/user/:id/status', {boolean})
server.post('/user/:id/status', (req, res) => {
  const { id } = req.params;
  const { sharing } = req.body;
  if (id == infoUser && id == activeUser) {
    db.checkPassword(id)
      .then((user) => {
        newUser = {
          ...user,
          sharing,
        };
        db.editItem(id, newUser, 'users')
          .then(() => {
            res.json(newUser);
          })
          .catch((err) => catchPhrase(err, res));
      })
      .catch((err) => catchPhrase(err, res));
  } else {
    notAuthorized(res);
  }
});

// ------------------------------------------------
//           -- DELETE --

// delete user account
server.delete('/user/:id', (req, res) => {
  const { id } = req.params;
  if (id == infoUser && id == activeUser) {
    db.deleteItem(id, 'books')
      .then((num) => {
        if (num) {
          res.json(num);
        } else {
          res.send('No user found')
        }
      })
      .catch((err) => catchPhrase(err, res));
  } else {
    notAuthorized(res);
  }
});

// delete book
// .delete('/user/:id/books/:isbn')
server.delete('/user/:id/books/:isbn', (req, res) => {
  const { id } = req.params;
  if (id == infoUser && id == activeUser) {
    db.deleteUser(id, 'users')
      .then((num) => {
        if (num) {
          res.json(num);
        } else {
          res.send("No book found")
        }
      })
      .catch((err) => catchPhrase(err, res));
  } else {
    notAuthorized(res);
  }
});

// delete school colors
// .delete('/user/:id/color')


// -- LISTEN --

server.listen(port, () => {
  // start watching for connections on the port specified
  console.log(`Server running at port ${port}/`);
});
