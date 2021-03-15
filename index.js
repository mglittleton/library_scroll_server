require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');

const cors = require('./middleware/cors');
const db = require('./middleware/helpers');
const auth = require('./middleware/authenticate');
const server = express();
const port = process.env.PORT || 5000;

// variables used to track authorization to information
let activeUser = 0;
let infoUser = 0;
let sharing = false;

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
          res.status(401).send('You are not authorized to this info');
        }
      } else {
        // response - no user found
        res.status(404).send('This user cannot be found');
      }
    })
    .catch((err) => {
      // response - typical server error
      res.status(500).send(err);
    });
});

// list of books
// return array of books if either auth or guest
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
        // response - sharing is not turned on
        res.status(401).send('You are not authorized to this info');
      }
    })
    .catch((err) => {
      // response - typical server error
      res.status(500).send(err);
    });
});

// one book info
// return book object
// .get('/user/:id/books/:isbn')

// share status of user id
// .get('/user/:id/status')

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
    .catch((err) => {
      res.status(500).send(err);
    });
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
    .catch((err) => {
      res.status(500).send(err);
    });
});

// add a book
server.post('/user/:id/books', (req, res) => {
  const id = req.params.id;
  const book = req.body.book;
  if (id == infoUser && id == activeUser) {
    db.addBook(book, activeUser)
      .then(() => {
        db.getBookList(activeUser)
          .then((books) => {
            // response - all is good
            res.status(201).json(books);
          })
          .catch((err) => {
            // response - typical server error
            res.status(500).send(err);
          });
      })
      .catch((err) => {
        // response - typical server error
        res.status(500).send(err);
      });
  } else {
    // response - sharing is not turned on
    res.status(401).send('You are not authorized to this action');
  }
});

// ------------------------------------------------
//           -- PUT --

// change password
// .put('/user/:id', {email, curr_password, new_password})

// change a book description
// .put('/user/:id'/books/:isbn, {description})

// clear a book description
// .put('/user/:id'/books/:isbn, {})
// ** should this be a delete?

// change a book ISBN ** probably doesn't need to be here
// .delete('/user/:id/books/:isbn')
// .post('/user/:id/books', {isbn})

// change school colors
// .put('/user/:id/color', {rgb hex color})

// change share status
// .put('/user/:id/status', {boolean})

// ------------------------------------------------
//           -- DELETE --

// delete user account
// .delete('/user/:id')

// delete book
// .delete('/user/:id/books/:isbn')

// delete school colors
// .delete('/user/:id/color')

// -- LISTEN --

server.listen(port, () => {
  // start watching for connections on the port specified
  console.log(`Server running at port ${port}/`);
});
