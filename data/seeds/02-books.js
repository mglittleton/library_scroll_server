exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('books')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('books').insert([
        {
          id: 1,
          isbn: 9781627791151,
          title: 'Test Title',
          description:
            'This book tells a tale of a test that takes place in the heart of this web app.',
          user_id: 1,
        },
        {
          id: 2,
          isbn: 9781338157796,
          user_id: 1,
        },
        {
          id: 3,
          isbn: 9781338255720,
          user_id: 1,
        },
        {
          id: 4,
          isbn: 9781534437333,
          user_id: 1,
        },
        {
          id: 5,
          isbn: 9781368013840,
          user_id: 1,
        },
        {
          id: 6,
          isbn: 9780545946179,
          user_id: 1,
        },
        {
          id: 7,
          isbn: 9780545723336,
          user_id: 1,
        },
        {
          id: 8,
          isbn: 9781368039932,
          user_id: 1,
        },
        {
          id: 9,
          isbn: 9781338129304,
          user_id: 1,
        },
      ]);
    });
};

