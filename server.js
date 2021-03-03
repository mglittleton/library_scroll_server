// const http = require('http'); // built in node.js module to handle http traffic
const express = require('express')

const server = express()
const port = 5000; // a port we'll use to watch for traffic
const hobbits = [
  {
    id: 1,
    name: 'Samwise Gamgee',
  },
  {
    id: 2,
    name: 'Frodo Baggins',
  },
];

// -- GET --

server.get('/', (req, res) => {
  res.send("Hello World")
})

server.get('/hobbits', (req, res) => {
  res.send(hobbits)
})

// -- LISTEN -- 

server.listen(port, () => {
  // start watching for connections on the port specified
  console.log(`Server running at port ${port}/`);
});