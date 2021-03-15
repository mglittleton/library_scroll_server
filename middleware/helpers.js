const knex = require('knex');

const dbConfig = require('../knexfile');
const db = knex(dbConfig.development);

const getUserInfo = (id) => {
  return db('users')
    .where('id', id)
    .select(
      'id',
      'sharing',
      'color1r',
      'color1g',
      'color1b',
      'color2r',
      'color2g',
      'color2b'
    )
    .first();
};

const getBookList = (id) => {
  return db('books').where('user_id', id);
};

const addBook = (book, id) => {
  book.user_id = id;
  return db('books').insert(book);
};

const addUser = (creds) => {
  return db('users').insert(creds);
};

const login = (creds) => {
  return db('users').where('username', creds.username).first();
};

module.exports = {
  getUserInfo: getUserInfo,
  getBookList: getBookList,
  addBook: addBook,
  addUser: addUser,
  login: login,
};
