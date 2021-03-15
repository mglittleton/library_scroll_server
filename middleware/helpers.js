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
    );
};

const getBookList = (id) => {
  return db('books').where('user_id', id);
};

module.exports = {
  getUserInfo: getUserInfo,
  getBookList: getBookList,
};
