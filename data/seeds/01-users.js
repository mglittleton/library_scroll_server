require('dotenv').config()

exports.seed = function (knex) {
  // Deletes ALL existing entries
  adminUN = process.env.ADMIN_USERNAME;
  adminPW = process.env.ADMIN_PASSWORD;
  return knex('users')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {
          id: 1,
          username: adminUN,
          password: adminPW,
          sharing: false,
          color1r: 119,
          color1g: 49,
          color1b: 65,
          color2r: 211,
          color2g: 159,
          color2b: 46,
        }
      ]);
    });
};

