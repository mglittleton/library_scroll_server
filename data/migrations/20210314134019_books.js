exports.up = function (knex) {
  return knex.schema.createTable('books', (table) => {
    table.increments();
    table.integer('isbn').notNullable();
    table.string('title', 50);
    table.string('description', 350);
    table.integer('user_id').notNullable();
    table.foreign('user_id').references('id').on('users');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('books');
};

/*
id: int
user_id: int, foreign
isbn: int
title: text
description: text
*/
