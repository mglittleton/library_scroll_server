// const http = require('http'); // built in node.js module to handle http traffic
const express = require('express');

const server = express();
const port = 5000; // a port we'll use to watch for traffic

server.use(express.json())

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

let nextId = 3

// -- GET --

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

server.post('/hobbits', (req, res) => {
  const hobbit = req.body
  hobbit.id = nextId++

  hobbits.push(hobbit)

  res.status(201).json(hobbits);
});

// -- PUT --

server.put('/hobbits/:id', (req, res) => {
  const hobbit = hobbits.find(h => h.id === req.params.id)

  if (!hobbit) {
    res.status(404).json({message: "That hobbit was not found"})
  } else {
    Object.assign(hobbit, req.body)

    res.status(200).json(hobbit);
  }

});

// -- DELETE --

server.delete('/hobbits/:id', (req, res) => {
  const { id } = req.params;
  const hobbit = hobbits.findIndex(h => h.id == id)
  console.log(hobbit)
  if (hobbit == -1) {
    res.status(404).json({message: "Hobbit not found"})
  } else {
    hobbits.splice(hobbit, 1)
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
