exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments();
    table.string('username').notNullable().unique();
    table.string('password').notNullable();
    table.boolean('sharing').defaultTo(false);
    table.integer('color1r');
    table.integer('color1g');
    table.integer('color1b');
    table.integer('color2r');
    table.integer('color2g');
    table.integer('color2b');
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
