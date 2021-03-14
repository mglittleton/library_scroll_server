const express = require('express');
const bcrypt = require('bcryptjs');

const cors = require('./middleware/cors');
const db = require('./middleware/helpers');
const auth = require('./middleware/authenticate');
const server = express();
const port = process.env.PORT || 5000; 
let activeUser = 0;

server.use(express.json(), cors);

const hobbits = [
  {
    id: 1,
    name: 'Samwise Gamgee',
    age: 111,
  },
  {
    id: 2,
    name: 'Frodo Baggins',
    age: 33,
  },
];

let nextId = 3;

// -- GET --

/*
  // active user
    // .get('/user/:id')
  // list of books
    // .get('/user/:id/books')
  // one book description
    // .get('/user/:id/books/:isbn')
  // school colors
    // .get('/user/:id/color')
  // share status of user id
    // .get('/user/:id/status')
*/

server.get('/', (req, res) => {
  res.status(200).send('Hello World');
});

server.get('/hobbits', (req, res) => {
  const sortField = req.query.sortby || 'id';

  const response = hobbits.sort((a, b) =>
    a[sortField] < b[sortField] ? -1 : 1
  );

  res.status(200).json(response);
});

// -- POST --

/*
  // register
    // .post('/user/register', {email, password})
  // login
    // .post('/user/login', {email, password})
  // add a book
    // .post('/user/:id/books', {isbn})
*/

server.post('/hobbits', (req, res) => {
  const hobbit = req.body;
  hobbit.id = nextId++;

  hobbits.push(hobbit);

  res.status(201).json(hobbits);
});

// -- PUT --

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

server.put('/hobbits/:id', (req, res) => {
  const hobbit = hobbits.find((h) => h.id === req.params.id);

  if (!hobbit) {
    res.status(404).json({ message: 'That hobbit was not found' });
  } else {
    Object.assign(hobbit, req.body);

    res.status(200).json(hobbit);
  }
});

// -- DELETE --

/*
  // delete user account
    // .delete('/user/:id')
  // delete book
    // .delete('/user/:id/books/:isbn')
  // delete school colors
    // .delete('/user/:id/color')
*/

server.delete('/hobbits/:id', (req, res) => {
  const { id } = req.params;
  const hobbit = hobbits.findIndex((h) => h.id == id);
  console.log(hobbit);
  if (hobbit == -1) {
    res.status(404).json({ message: 'Hobbit not found' });
  } else {
    hobbits.splice(hobbit, 1);
    res.status(200).json({
      url: `/hobbits/${id}`,
      operation: `DELETE for hobbit with id ${id}`,
    });
  }
});

// -- LISTEN --

server.listen(port, () => {
  // start watching for connections on the port specified
  console.log(`Server running at port ${port}/`);
});
