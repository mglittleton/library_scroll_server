const knex = require('knex');

const dbConfig = require('../knexfile');
const db = knex(dbConfig.development);

const getUserInfo = (id) => {
  return db('users').where("id", id).first()
}



module.exports = {
  getUserInfo: getUserInfo,
};
