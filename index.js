require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');

const cors = require('./middleware/cors');
const db = require('./middleware/helpers');
const auth = require('./middleware/authenticate');
const server = express();
const port = process.env.PORT || 5000;
let activeUser = 0;

server.use(express.json(), cors);

// --------------------------------------------
//          -- GET --

server.get('/', (req, res) => {
  res.status(200).send('Hello World');
});

// get active user
// return userinfo (colors) if either auth or guest
server.get('/user/:id', auth.protected, (req, res) => {
  const id = req.params.id;
  const userID = req.userID;
  db.getUserInfo(id)
    .then((user) => {
      const authUser = user[0];
      // checking to make sure the user searched for exists
      if (authUser != undefined) {
        authUser.auth = userID == id ? true : false;
        authUser.sharing = authUser.sharing ? true : false;
        // allows access to info if authorized user or info is shared
        if (authUser.auth || authUser.sharing) {
          // response - all is good
          res.json(authUser);
        } else {
          // response - no authorization or sharing
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
// .get('/user/:id/books')

// one book info
// return book object
// .get('/user/:id/books/:isbn')

// share status of user id
// .get('/user/:id/status')

// -------------------------------------------------
//          -- POST --

/*
  // register
    // .post('/user/register', {email, password})
  // login
    // .post('/user/login', {email, password})
  // add a book
    // .post('/user/:id/books', {isbn})
*/

// ------------------------------------------------
//           -- PUT --

/*
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
*/

// ------------------------------------------------
//           -- DELETE --

/*
  // delete user account
    // .delete('/user/:id')
  // delete book
    // .delete('/user/:id/books/:isbn')
  // delete school colors
    // .delete('/user/:id/color')
*/

// -- LISTEN --

server.listen(port, () => {
  // start watching for connections on the port specified
  console.log(`Server running at port ${port}/`);
});
