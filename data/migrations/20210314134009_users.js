exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments();
    table.string('username').notNullable().unique();
    table.string('password').notNullable();
    table.boolean('sharing')
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};

/*
id: int
email: text
password: text
sharing: boolean (int 0 or 1)
*/
